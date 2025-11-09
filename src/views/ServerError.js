export default {
  async render(message = 'An unexpected error occurred') {
    return `
      <div class="center">
        <h2>500 - Server error</h2>
        <p class="muted">${message}</p>
        <a href="#/" data-link class="btn">Back to home</a>
      </div>
    `;
  }
};