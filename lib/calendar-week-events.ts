import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export interface WeekCalendarEvent {
  id: string;
  type: string;
  title: string;
  start: string;
}

/**
 * Parse contentCalendar (JSON from LaunchMap) et retourne les événements de la semaine en cours (lundi à dimanche).
 */
export function getWeekEvents(contentCalendar: unknown): WeekCalendarEvent[] {
  if (!contentCalendar || typeof contentCalendar !== 'object' || !('events' in contentCalendar)) {
    return [];
  }
  const rawEvents = (contentCalendar as { events: unknown }).events;
  if (!Array.isArray(rawEvents)) return [];

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const events: WeekCalendarEvent[] = [];
  for (const e of rawEvents) {
    if (!e || typeof e !== 'object' || !('id' in e) || !('type' in e) || !('title' in e) || !('start' in e)) continue;
    const startStr = String((e as { start: string }).start);
    const datePart = startStr.slice(0, 10);
    let date: Date;
    try {
      date = parseISO(datePart);
    } catch {
      continue;
    }
    if (!isWithinInterval(date, { start: weekStart, end: weekEnd })) continue;
    events.push({
      id: String((e as { id: string }).id),
      type: String((e as { type: string }).type),
      title: String((e as { title: string }).title ?? ''),
      start: startStr,
    });
  }
  events.sort((a, b) => a.start.localeCompare(b.start));
  return events;
}
