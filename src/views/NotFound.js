export default {
  async render() {
    return `
      <div class="center">
        <h2>404 - Not found</h2>
        <p class="muted">The requested page does not exist.</p>
        <a href="#/" data-link class="btn">Back to home</a>
      </div>
    `;
  }
};