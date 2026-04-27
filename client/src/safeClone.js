// safeClone.js
export function deepClone(obj) {
  return structuredClone
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj));
}
``
