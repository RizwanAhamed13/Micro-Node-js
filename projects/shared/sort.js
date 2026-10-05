// #region Sort & Filter
export const SORTABLE = ['price', 'rating', 'discount', 'company'];

export function sortBy(list, field, order = 'asc') {
  if (!SORTABLE.includes(field)) return list;
  const dir = order === 'desc' ? -1 : 1;
  return [...list].sort((a, b) => (a[field] > b[field] ? dir : a[field] < b[field] ? -dir : 0));
}

export function inPriceRange(list, min = 0, max = Infinity) {
  return list.filter((p) => p.price >= Number(min) && p.price <= Number(max));
}
// #endregion
