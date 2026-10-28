function parsePagination(query) {
  const page  = query.page  !== undefined ? Number(query.page)  : 1;
  const limit = query.limit !== undefined ? Number(query.limit) : 10;

  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    return { error: "page and limit must be positive integers" };
  }

  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { parsePagination };
