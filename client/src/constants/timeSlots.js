export const MORNING_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
];

export const EVENING_SLOTS = [
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
];

export const ALL_CLINIC_SLOTS = [...MORNING_SLOTS, ...EVENING_SLOTS];

export function formatSlotLabel(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  if (isNaN(hours)) return timeStr;
  const mins = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");
  
  return `${formattedHours}:${mins} ${ampm}`;
}
