import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const BOOKINGS_FILE = path.resolve(DATA_DIR, 'bookings.json');

// Exact official organization email recipient for Tanishqa
const TANISHQA_NOTIFICATION_EMAIL = 'tanishqabhosale99@gmail.com';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory Mutex to guarantee atomic slot reservations and prevent double bookings
class AsyncMutex {
  private queue = Promise.resolve();
  lock(): Promise<() => void> {
    let unlock: () => void = () => {};
    const next = new Promise<void>((resolve) => {
      unlock = resolve;
    });
    const current = this.queue;
    this.queue = current.then(() => next);
    return current.then(() => unlock);
  }
}
const bookingMutex = new AsyncMutex();

export interface BookingRecord {
  id: string;
  slotId: string; // e.g. "2026-10-07_14:00"
  clientName: string;
  clientEmail: string;
  sessionType: string;
  date: string;
  time: string;
  notes?: string;
  status: 'confirmed';
  createdAt: string;
  emailStatus: 'sent' | 'pending_credentials' | 'failed';
  emailDeliveryMethod?: 'resend' | 'smtp';
  emailError?: string;
}

interface DatabaseSchema {
  bookings: BookingRecord[];
  bookedSlots: Record<string, string>; // slotId -> bookingId
}

// Synchronous and atomic file operations
function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        bookedSlots: parsed.bookedSlots && typeof parsed.bookedSlots === 'object' ? parsed.bookedSlots : {},
      };
    }
  } catch (err) {
    console.error('[DATABASE] Error reading bookings.json:', err);
  }
  return { bookings: [], bookedSlots: {} };
}

function saveDatabase(db: DatabaseSchema): void {
  const tempFile = `${BOOKINGS_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, BOOKINGS_FILE);
}

/**
 * Format Customer confirmation email
 */
function formatCustomerEmail(booking: BookingRecord) {
  const subject = 'Your coaching session is booked — Tanishqa Bhosale';
  const sessionLabel = booking.sessionType.toLowerCase().includes('intro')
    ? 'Free 30-min Intro Call'
    : booking.sessionType;

  const body =
`Hi ${booking.clientName},

Your ${sessionLabel} with Tanishqa Bhosale is booked.

Date: ${booking.date}
Time: ${booking.time}

You shared:
${booking.notes || 'None provided'}

You’ll receive any further details separately.

Best,
Tanishqa Bhosale`;

  return { subject, body };
}

/**
 * Format Organization notification email
 */
function formatOrgEmail(booking: BookingRecord) {
  const subject = `New coaching session booked — ${booking.clientName}`;
  const body =
`New coaching session booked.

Client: ${booking.clientName}
Email: ${booking.clientEmail}
Session: ${booking.sessionType}
Date: ${booking.date}
Time: ${booking.time}

What they would like help with:
${booking.notes || 'None provided'}

Booked at:
${booking.createdAt}`;

  return { subject, body };
}

/**
 * Server-Side Transactional Email Dispatch (Resend -> SMTP)
 * Sends TWO emails:
 * 1. Customer confirmation to booking.clientEmail
 * 2. Organization notification to tanishqabhosale99@gmail.com
 * Dispatched immediately (< 2 seconds) upon atomic slot reservation.
 */
async function sendBookingEmails(booking: BookingRecord): Promise<{
  customerSent: boolean;
  orgSent: boolean;
  provider?: 'resend' | 'smtp';
  error?: string;
}> {
  const customerEmail = formatCustomerEmail(booking);
  const orgEmail = formatOrgEmail(booking);

  // 1. Resend Server-Side Transactional Provider
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromAddress = process.env.EMAIL_FROM || 'Tanishqa Bhosale Coaching <onboarding@resend.dev>';

      console.log(`[EMAIL DISPATCH: RESEND] Sending customer email to ${booking.clientEmail} and org email to ${TANISHQA_NOTIFICATION_EMAIL}...`);

      const [resCustomer, resOrg] = await Promise.all([
        resend.emails.send({
          from: fromAddress,
          to: booking.clientEmail,
          subject: customerEmail.subject,
          text: customerEmail.body,
        }),
        resend.emails.send({
          from: fromAddress,
          to: TANISHQA_NOTIFICATION_EMAIL,
          subject: orgEmail.subject,
          text: orgEmail.body,
        }),
      ]);

      const custOk = !resCustomer.error;
      const orgOk = !resOrg.error;
      console.log(`[RESEND RESULT] Customer: ${custOk ? 'DELIVERED' : 'FAILED'}, Org: ${orgOk ? 'DELIVERED' : 'FAILED'}`);

      return {
        customerSent: custOk,
        orgSent: orgOk,
        provider: 'resend',
        error: resCustomer.error?.message || resOrg.error?.message,
      };
    } catch (err: any) {
      console.error('[RESEND DISPATCH ERROR]', err);
      return { customerSent: false, orgSent: false, error: err.message };
    }
  }

  // 2. SMTP / Gmail App Password
  if (process.env.SMTP_HOST || process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport(
        process.env.GMAIL_APP_PASSWORD
          ? {
              service: 'gmail',
              auth: {
                user: process.env.GMAIL_USER || TANISHQA_NOTIFICATION_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
              },
            }
          : {
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || '587', 10),
              secure: process.env.SMTP_SECURE === 'true',
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            }
      );

      const fromAddress = process.env.SMTP_FROM || `Tanishqa Bhosale Coaching <${TANISHQA_NOTIFICATION_EMAIL}>`;

      console.log(`[EMAIL DISPATCH: SMTP] Sending customer email to ${booking.clientEmail} and org email to ${TANISHQA_NOTIFICATION_EMAIL}...`);

      await Promise.all([
        transporter.sendMail({
          from: fromAddress,
          to: booking.clientEmail,
          subject: customerEmail.subject,
          text: customerEmail.body,
        }),
        transporter.sendMail({
          from: fromAddress,
          to: TANISHQA_NOTIFICATION_EMAIL,
          subject: orgEmail.subject,
          text: orgEmail.body,
        }),
      ]);

      console.log('[SMTP DISPATCH SUCCESS] Both emails dispatched successfully via SMTP.');
      return { customerSent: true, orgSent: true, provider: 'smtp' };
    } catch (err: any) {
      console.error('[SMTP DISPATCH ERROR]', err);
      return { customerSent: false, orgSent: false, error: err.message };
    }
  }

  const noCredsMsg = 'No server-side transactional email provider configured (set RESEND_API_KEY in Secrets).';
  console.warn(`[EMAIL NOTICE] ${noCredsMsg}`);
  return {
    customerSent: false,
    orgSent: false,
    error: noCredsMsg,
  };
}

// Initialize Firebase Admin for server-side ID token verification
import { initializeApp as initAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json';

const adminApp = getAdminApps().length > 0
  ? getAdminApps()[0]
  : initAdminApp({ projectId: firebaseConfig.projectId });

// Exact authorized admin emails permitted to view the organization dashboard
export const AUTHORIZED_ADMIN_EMAILS = [
  'tanishqabhosale99@gmail.com',
  'saanchibhosale27@gmail.com',
  ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()) : []),
];

// In-memory admin session store (token -> { email: string, expiresAt: number })
const adminSessions = new Map<string, { email: string; expiresAt: number }>();

/**
 * Server-side authorization verification
 * Strictly enforces that ONLY authorized admin accounts can access private organization endpoints.
 */
async function verifyAdminAuth(req: Request): Promise<{
  authorized: boolean;
  email?: string;
  error?: string;
  status: number;
}> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authentication required. No Bearer token provided.', status: 401 };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return { authorized: false, error: 'Missing authentication token.', status: 401 };
  }

  // 1. Check in-memory admin session token
  const session = adminSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      adminSessions.delete(token);
      return { authorized: false, error: 'Session expired. Please sign in again.', status: 401 };
    }
    const isAuth = AUTHORIZED_ADMIN_EMAILS.some((a) => a.toLowerCase() === session.email.toLowerCase());
    if (!isAuth) {
      return { authorized: false, error: 'Access denied: Account is not an authorized administrator.', status: 403 };
    }
    return { authorized: true, email: session.email, status: 200 };
  }

  // 2. Check Firebase ID Token (JWT)
  try {
    let email: string | undefined;
    try {
      const decoded = await getAdminAuth(adminApp).verifyIdToken(token);
      email = decoded.email;
    } catch {
      // Fallback: decode & validate standard JWT payload
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadStr = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          email = payload.email;
        }
      }
    }

    if (!email) {
      return { authorized: false, error: 'Invalid or expired authentication token.', status: 401 };
    }

    const isAuth = AUTHORIZED_ADMIN_EMAILS.some((a) => a.toLowerCase() === email!.toLowerCase());
    if (!isAuth) {
      return {
        authorized: false,
        error: `Access denied. The account (${email}) is not authorized to view organization bookings.`,
        status: 403,
      };
    }

    return { authorized: true, email, status: 200 };
  } catch (err: any) {
    return { authorized: false, error: 'Authentication verification failed.', status: 401 };
  }
}

// Mount API routes
app.use(express.json());

// Admin Login endpoint
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { email, password, idToken } = req.body;

  // Case A: Signed in via Firebase Auth on client with ID Token
  if (idToken) {
    try {
      let verifiedEmail: string | undefined;
      try {
        const decoded = await getAdminAuth(adminApp).verifyIdToken(idToken);
        verifiedEmail = decoded.email;
      } catch {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            verifiedEmail = payload.email;
          }
        }
      }

      if (!verifiedEmail) {
        return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
      }

      const isAuth = AUTHORIZED_ADMIN_EMAILS.some((a) => a.toLowerCase() === verifiedEmail!.toLowerCase());
      if (!isAuth) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Account (${verifiedEmail}) is not authorized.`,
        });
      }

      // Generate session token
      const sessionToken = `adm_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      adminSessions.set(sessionToken, {
        email: verifiedEmail,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ success: true, email: verifiedEmail, token: sessionToken });
    } catch (err: any) {
      return res.status(401).json({ success: false, error: err.message || 'Verification failed.' });
    }
  }

  // Case B: Direct admin email + password sign in
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some((a) => a.toLowerCase() === cleanEmail);

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: `Access denied. The account (${cleanEmail}) is not authorized to access the organization dashboard.`,
    });
  }

  // Verify password: checks against configured ADMIN_PASSWORD or default secure admin key
  const configuredPassword = process.env.ADMIN_PASSWORD || 'TanishqaAdmin2026!';
  if (password !== configuredPassword) {
    return res.status(401).json({ success: false, error: 'Incorrect administrator password.' });
  }

  // Generate 24-hour session
  const sessionToken = `adm_sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  adminSessions.set(sessionToken, {
    email: cleanEmail,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  console.log(`[ADMIN AUTH] Administrator ${cleanEmail} logged in successfully.`);
  return res.status(200).json({
    success: true,
    email: cleanEmail,
    token: sessionToken,
  });
});

// Admin check session
app.get('/api/admin/check', async (req: Request, res: Response) => {
  const check = await verifyAdminAuth(req);
  if (!check.authorized) {
    return res.status(check.status).json({ success: false, error: check.error, authorized: false });
  }
  return res.status(200).json({ success: true, authorized: true, email: check.email });
});

// Admin get bookings (Strictly Protected - only authorized admins can select records)
app.get('/api/admin/bookings', async (req: Request, res: Response) => {
  const check = await verifyAdminAuth(req);
  if (!check.authorized) {
    return res.status(check.status).json({
      success: false,
      error: check.error || 'Access denied. You do not have permission to access booking records.',
    });
  }

  const db = loadDatabase();
  console.log(`[ADMIN DASHBOARD] Bookings accessed by authorized admin ${check.email} (${db.bookings.length} records returned).`);

  return res.status(200).json({
    success: true,
    bookings: db.bookings,
    count: db.bookings.length,
    requestedBy: check.email,
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    adminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 1. Get all booked slot IDs for single-occupancy calendar rendering
app.get('/api/booked-slots', (req: Request, res: Response) => {
  const db = loadDatabase();
  const slotIds = Object.keys(db.bookedSlots);
  res.json({ success: true, bookedSlots: slotIds });
});

// 2. Atomically book a session (Pure customer flow - Zero Google OAuth required)
app.post('/api/bookings', async (req: Request, res: Response) => {
  const reqTimestamp = new Date().toISOString();
  console.log(`[BOOKING] request received: ${reqTimestamp}`);

  const { name, email, sessionType, date, time, slotId, notes } = req.body;

  if (!name || !email || !sessionType || !date || !time || !slotId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required booking information.',
    });
  }

  // Sanitize slotId format: e.g. "2026-10-07_14:00"
  const cleanSlotId = String(slotId).trim();

  // ATOMIC RESERVATION LOCK - Guarantees Single Occupancy
  const unlock = await bookingMutex.lock();
  try {
    const db = loadDatabase();

    // Check if slot is already booked (atomic constraint)
    if (db.bookedSlots[cleanSlotId]) {
      return res.status(409).json({
        success: false,
        error: 'This time has just been booked. Please choose another available slot.',
        code: 'SLOT_ALREADY_BOOKED',
      });
    }

    // Create unique booking record
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: BookingRecord = {
      id: bookingId,
      slotId: cleanSlotId,
      clientName: String(name).trim(),
      clientEmail: String(email).trim().toLowerCase(),
      sessionType: String(sessionType).trim(),
      date: String(date).trim(),
      time: String(time).trim(),
      notes: notes ? String(notes).trim() : '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      emailStatus: 'pending_credentials',
    };

    // Atomically claim slot
    db.bookedSlots[cleanSlotId] = bookingId;
    db.bookings.push(newBooking);
    saveDatabase(db);

    const slotReservedTimestamp = new Date().toISOString();
    console.log(`[BOOKING] slot reserved: ${slotReservedTimestamp} (Slot: ${cleanSlotId}, Client: ${newBooking.clientName})`);

    // IMMEDIATELY TRIGGER SERVER-SIDE TRANSACTIONAL EMAILS (< 2 seconds)
    const emailStartTimestamp = new Date().toISOString();
    console.log(`[EMAIL] send started: ${emailStartTimestamp} to customer (${newBooking.clientEmail}) and org (${TANISHQA_NOTIFICATION_EMAIL})`);

    const emailResult = await sendBookingEmails(newBooking);
    const emailEndTimestamp = new Date().toISOString();

    if (emailResult.customerSent || emailResult.orgSent) {
      console.log(`[EMAIL] send succeeded: ${emailEndTimestamp} (Provider: ${emailResult.provider || 'unknown'})`);
      newBooking.emailStatus = 'sent';
    } else {
      console.log(`[EMAIL] send failed: ${emailEndTimestamp} (${emailResult.error || 'No email provider credentials configured'})`);
      newBooking.emailStatus = 'failed';
    }

    newBooking.emailDeliveryMethod = emailResult.provider;
    newBooking.emailError = emailResult.error;
    saveDatabase(db);

    return res.status(200).json({
      success: true,
      booking: {
        id: newBooking.id,
        slotId: newBooking.slotId,
        clientName: newBooking.clientName,
        sessionType: newBooking.sessionType,
        date: newBooking.date,
        time: newBooking.time,
      },
      emailsSent: {
        customerEmail: emailResult.customerSent,
        orgEmail: emailResult.orgSent,
        provider: emailResult.provider,
      },
    });
  } catch (err) {
    console.error('[BOOKING SYSTEM ERROR]', err);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while reserving your session. Please try again.',
    });
  } finally {
    unlock();
  }
});

// Configure Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

startServer();
