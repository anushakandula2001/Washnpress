import { useMemo, useState } from "react";

export function usePagination<T>(items: T[], defaultPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const paginated = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize, totalPages]);

  const from = total === 0 ? 0 : (Math.min(page, totalPages) - 1) * pageSize + 1;
  const to = Math.min(Math.min(page, totalPages) * pageSize, total);

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function setSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return { page, pageSize, total, totalPages, paginated, from, to, goTo, setSize, setPage };
}
