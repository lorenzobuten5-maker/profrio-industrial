/**
 * fuzzy-search.js — ProFrio Industrial Fuzzy Search Engine v25.2
 * Búsqueda difusa tolerante a errores ortográficos para listas de formularios y clientes.
 */

function calcLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyMatch(query, text) {
  if (!query || !text) return false;

  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();

  // Substring match
  if (t.includes(q)) return true;

  // Token word match
  const qTokens = q.split(/\s+/);
  const tTokens = t.split(/\s+/);

  return qTokens.every(qToken => {
    return tTokens.some(tToken => {
      if (tToken.includes(qToken)) return true;
      if (qToken.length >= 4 && tToken.length >= 4) {
        const dist = calcLevenshteinDistance(qToken, tToken);
        return dist <= 2; // Allow up to 2 typos for words >= 4 chars
      }
      return false;
    });
  });
}

function filterArrayFuzzy(items, query, keys) {
  if (!query || !query.trim()) return items;

  return items.filter(item => {
    return keys.some(key => {
      const val = item[key];
      if (!val) return false;
      return fuzzyMatch(query, String(val));
    });
  });
}

window.calcLevenshteinDistance = calcLevenshteinDistance;
window.fuzzyMatch              = fuzzyMatch;
window.filterArrayFuzzy        = filterArrayFuzzy;
