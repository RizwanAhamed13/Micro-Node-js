// #region Strings & Tries
// Each node counts how many words pass through it.
export function buildTrie(words) {
  const root = { count: 0, kids: {} };
  for (const word of words) {
    let node = root;
    for (const ch of word) {
      node.kids[ch] ??= { count: 0, kids: {} };
      node = node.kids[ch];
      node.count++;
    }
  }
  return root;
}

// The shortest prefix that no other word shares.
export function uniquePrefix(root, word) {
  let node = root;
  for (let i = 0; i < word.length; i++) {
    node = node.kids[word[i]];
    if (!node) return null;
    if (node.count === 1) return word.slice(0, i + 1);
  }
  return word; // the word is a prefix of another word
}
// #endregion
