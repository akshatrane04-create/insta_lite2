
function getPagination(query) {
  let page = 1;
  let limit = 10;

  if (query.page !== undefined) {
    if (!/^\d+$/.test(query.page) || Number(query.page) < 1) {
      return { error: "page and limit must be positive integers" };
    }
    page = Number(query.page);
  }

  if (query.limit !== undefined) {
    if (!/^\d+$/.test(query.limit) || Number(query.limit) < 1) {
      return { error: "page and limit must be positive integers" };
    }
    limit = Number(query.limit);
  }


  if (limit > 50) {
    limit = 50;
  }

  return { page, limit };
}

function makeMeta(page, limit, total) {
  return {
    page: page,
    limit: limit,
    total: total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { getPagination, makeMeta };
