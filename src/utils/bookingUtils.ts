export function getSlotId(dateObjOrIso: Date | string, timeStr: string): string {
  let datePart = '';
  if (typeof dateObjOrIso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateObjOrIso)) {
    datePart = dateObjOrIso;
  } else {
    const d = typeof dateObjOrIso === 'string' ? new Date(dateObjOrIso) : dateObjOrIso;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    datePart = `${year}-${month}-${day}`;
  }

  // Convert time "2:00 PM" -> "14:00"
  const timeMap: Record<string, string> = {
    '10:00 AM': '10:00',
    '11:30 AM': '11:30',
    '2:00 PM': '14:00',
    '3:30 PM': '15:30',
    '5:00 PM': '17:00',
    '6:30 PM': '18:30',
  };

  const timePart = timeMap[timeStr] || timeStr.replace(/[^0-9:]/g, '');
  return `${datePart}_${timePart}`;
}
