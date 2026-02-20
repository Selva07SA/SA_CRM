export type Pagination = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortDir: "asc" | "desc";
};

export const parsePagination = (query: Record<string, unknown>): Pagination => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const sortBy = typeof query.sortBy === "string" ? query.sortBy : "createdAt";
  const sortDir = query.sort === "asc" ? "asc" : "desc";
  return { page, limit, skip: (page - 1) * limit, sortBy, sortDir };
};
