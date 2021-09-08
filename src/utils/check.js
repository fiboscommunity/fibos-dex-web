export default data => {
  if (Object.prototype.toString.call(data) === '[object Number]' && data >= 0) return true

  if (Object.prototype.toString.call(data) !== '[object String]') return false
  if (!data || !data.trim()) return false
  if (Number.isNaN(Number(data))) return false

  return true
}
