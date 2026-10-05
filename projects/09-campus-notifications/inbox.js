import { topN } from '../shared/heap.js';

// #region Campus Notifications Microservice
export const WEIGHT = { Placement: 3, Result: 2, Event: 1 };

// Accept the different key spellings an upstream may use.
export const normalize = (n) => ({
  id: n.ID ?? n.id ?? n.notificationID,
  type: n.Type ?? n.type ?? n.notificationType,
  message: n.Message ?? n.message,
  timestamp: n.Timestamp ?? n.timestamp ?? n.createdAt,
  isRead: Boolean(n.isRead ?? n.read ?? false),
});

// true when a is less important than b: lower weight, or same weight and older.
const lessImportant = (a, b) =>
  ((WEIGHT[a.type] ?? 0) - (WEIGHT[b.type] ?? 0) || Date.parse(a.timestamp) - Date.parse(b.timestamp)) < 0;

// Top n unread: Placement > Result > Event, then newest first. Heap of size n.
export function priorityInbox(list, n = 10, readIds = new Set()) {
  const unread = list.map(normalize).filter((x) => !x.isRead && !readIds.has(x.id));
  return topN(unread, n, lessImportant);
}
// #endregion
