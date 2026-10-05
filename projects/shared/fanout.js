// #region Fan-Out Calls
// Ask every source at once and tag each result with where it came from.
// One failing source does not fail the whole request.
export async function fromAll(sources, load) {
  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      const items = await load(source);
      return items.map((item) => ({ ...item, source }));
    }),
  );
  return settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}
// #endregion
