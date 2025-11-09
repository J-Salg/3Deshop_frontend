export function adminLayout(contentHtml, active = 'products') {
  return `
    <section class="admin">
      <aside class="sidebar">
        <h3>Admin</h3>
        <nav class="stack">
          <a class="btn link ${active==='products'?'active':''}" href="#/admin/products">Products</a>
          <a class="btn link ${active==='categories'?'active':''}" href="#/admin/categories">Categories</a>
          <a class="btn link ${active==='orders'?'active':''}" href="#/admin/orders">Orders</a>
          <a class="btn link ${active==='users'?'active':''}" href="#/admin/users">Users</a>
        </nav>
      </aside>
      <main class="content">
        ${contentHtml}
      </main>
    </section>
  `;
}