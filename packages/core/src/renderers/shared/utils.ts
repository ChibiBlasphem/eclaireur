export function map<K, V, KO, VO>(map: Map<K, V>, transformer: (entry: [K, V]) => [KO, VO]) {
  const newMap = new Map<KO, VO>();
  for (const [key, value] of map) {
    const [newKey, newValue] = transformer([key, value]);
    newMap.set(newKey, newValue);
  }
  return newMap;
}
