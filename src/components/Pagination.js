export default function Pagination({ pageNumber, totalPages }) {
  const prev = pageNumber > 0 ? `#/page/${pageNumber}` : null;
  const next = pageNumber + 1 < totalPages ? `#/page/${pageNumber + 2}` : null;
  return `
    <div class="pagination">
      <button class="btn" data-page="${pageNumber - 1}" ${pageNumber === 0 ? 'disabled' : ''}>Prev</button>
      <span class="badge">Page ${pageNumber + 1} / ${totalPages}</span>
      <button class="btn" data-page="${pageNumber + 1}" ${(pageNumber + 1) >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;
}