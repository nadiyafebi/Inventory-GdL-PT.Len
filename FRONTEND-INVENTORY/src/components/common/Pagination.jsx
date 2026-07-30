export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1 border rounded disabled:opacity-40"
      >
        Prev
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1 border rounded disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
