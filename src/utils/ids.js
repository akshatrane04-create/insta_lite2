
function parseId(value) {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    return null;
  }
  return id;
}

module.exports = { parseId };
