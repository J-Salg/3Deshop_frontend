let holder;

function ensure() {
  if (!holder) {
    holder = document.createElement('div');
    holder.id = 'toasts';
    holder.style.cssText = 'position:fixed;right:16px;bottom:16px;display:flex;flex-direction:column;gap:8px;z-index:10000;';
    document.body.appendChild(holder);
  }
}

export function showToast(msg, timeout = 2500) {
  ensure();
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'background:#333;color:#fff;padding:10px 14px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.25);';
  holder.appendChild(el);
  setTimeout(() => { el.remove(); }, timeout);
}