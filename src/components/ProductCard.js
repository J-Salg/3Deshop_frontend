import { formatUSD } from '../utils/format.js';
import { resolveImageUrl } from '../utils/fileUrls.js';

export default function ProductCard(p) {
  const img = resolveImageUrl(p.imageUrl);
  const media = img
    ? `<img src="${img}" alt="${p.name}"
           loading="lazy"
           onerror="this.outerHTML='\\x3cdiv class=\\'placeholder-image\\'\\x3eNo image\\x3c/div\\x3e'"/>`
    : `<div class="placeholder-image">No image</div>`;
  return `
    <div class="card">
      ${media}
      <div class="card-body">
        <div>${p.name}</div>
        <div class="price">${formatUSD(p.price)}</div>
        <a class="btn primary" href="#/product/${p.id}" data-link>View</a>
      </div>
    </div>
  `;
}