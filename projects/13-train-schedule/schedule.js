// #region Train Schedule Service
// #region Dates & Time Windows
// departureTime {Hours, Minutes, Seconds} is today's local time; delayedBy is minutes.
export function departureOf(train, now) {
  const d = new Date(now);
  d.setHours(train.departureTime.Hours, train.departureTime.Minutes, train.departureTime.Seconds ?? 0, 0);
  return d.getTime() + (train.delayedBy ?? 0) * 60_000;
}
// #endregion

// Trains leaving in (now + 30 min, now + 12 h], after delays, best first:
// price ascending, then seats descending, then departure descending.
export function upcomingTrains(trains, now = Date.now()) {
  const from = now + 30 * 60_000;
  const to = now + 12 * 60 * 60_000;
  const price = (t) => Math.min(t.price.sleeper, t.price.AC);
  const seats = (t) => t.seatsAvailable.sleeper + t.seatsAvailable.AC;

  return trains
    .map((t) => ({ ...t, departsAt: new Date(departureOf(t, now)).toISOString() }))
    .filter((t) => Date.parse(t.departsAt) > from && Date.parse(t.departsAt) <= to)
    .sort((a, b) => price(a) - price(b) || seats(b) - seats(a) || Date.parse(b.departsAt) - Date.parse(a.departsAt));
}
// #endregion
