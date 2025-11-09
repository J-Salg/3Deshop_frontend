import { productsApi } from '../api/products.js';
import { cartApi } from '../api/cart.js';
import { formatUSD } from '../utils/format.js';
import { resolveImageUrl, resolveModelUrl } from '../utils/fileUrls.js';
import { showToast } from '../utils/toast.js';
import { authStore } from '../store/authStore.js';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function modelViewer(id, modelUrl, fallbackImage) {
  return `
    <div class="viewer">
      <canvas id="canvas-${id}" class="fw" style="width:100%; height:100%"></canvas>
      ${!modelUrl && fallbackImage ? `<img src="${fallbackImage}" alt="preview"/>` : ``}
    </div>
  `;
}

function renderInfo(p) {
  return `
    <h2>${p.name}</h2>
    <div class="price">${formatUSD(p.price)}</div>
    <p class="muted">${p.description || ''}</p>
  <div class="kv"><span>Category</span><span>${p.category ? `${p.category.name} (#${p.category.id ?? '?'})` : '-'}</span></div>
    <div class="kv"><span>Stock</span><span>${p.stock}</span></div>
    <div class="row section">
      <input id="qty" class="input" type="number" value="1" min="1" style="max-width:120px"/>
      <button id="add" class="btn primary">Add to cart</button>
    </div>
  `;
}

function mountThree(canvas, url) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(2.5, 2, 3);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.zoomSpeed = 0.9;
  controls.panSpeed = 0.8;
  controls.minPolarAngle = 0.05;
  controls.maxPolarAngle = Math.PI * 0.95;

  const loader = new GLTFLoader();
  loader.setCrossOrigin('anonymous');

  loader.load(url, (gltf) => {
    const obj = gltf.scene;

    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 1.5 / maxDim; 
    obj.scale.setScalar(scaleFactor);

    const pivot = new THREE.Group();
    scene.add(pivot);
    pivot.add(obj);

    obj.position.sub(center).multiplyScalar(scaleFactor);

    const radius = box.getBoundingSphere(new THREE.Sphere()).radius * scaleFactor;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = radius / Math.sin(fov / 2) * 1.2;
    camera.position.set(distance, distance * 0.8, distance);
    controls.target.set(0, 0, 0);
    controls.minDistance = radius * 0.8;
    controls.maxDistance = radius * 6.0;
    controls.update();

    const panLimit = radius * 2.0;
    controls.addEventListener('change', () => {
      const t = controls.target;
      if (t.length() > panLimit) {
        t.multiplyScalar(panLimit / t.length());
        controls.update();
      }
    });

  }, undefined, (err) => {
    console.error('GLB load error', err);
    canvas.style.display = 'none';
  });

  function onResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  (function animate() {
    requestAnimationFrame(animate);
    onResize();
    controls.update();
    renderer.render(scene, camera);
  })();
}

export default {
  async render(id) {
    const p = await productsApi.get(id);
    const modelUrl = resolveModelUrl(p.modelUrl);
    const img = resolveImageUrl(p.imageUrl);
    const noImage = !img;
    const noModel = !modelUrl;
    const badges = [
      noImage ? '<span class="badge">No image</span>' : '',
      noModel ? '<span class="badge">No 3D model</span>' : ''
    ].filter(Boolean).join(' ');

    const mediaBlock = modelUrl || img
      ? modelViewer(p.id, modelUrl, img)
  : `<div class="viewer"><div class="no-media">No image / No model</div></div>`;

    return `
      <section class="product-detail">
        <div>
          ${mediaBlock}
          <div class="row" style="margin-top:8px; gap:6px">${badges}</div>
        </div>
        <div>
          ${renderInfo(p)}
        </div>
      </section>
    `;
  },

  async afterRender(id) {
    const p = await productsApi.get(id);
    const modelUrl = resolveModelUrl(p.modelUrl);
    const img = resolveImageUrl(p.imageUrl);

    if (modelUrl) {
      const canvas = document.getElementById(`canvas-${p.id}`);
      if (canvas) mountThree(canvas, modelUrl);
    } else {
      const canvas = document.getElementById(`canvas-${p.id}`);
      if (canvas) canvas.remove(); 
    }

    const add = document.getElementById('add');
    add?.addEventListener('click', async () => {
      if (!authStore.token()) {
        window.location.hash = '#/login';
        return;
      }
      const qty = Number(document.getElementById('qty').value || '1');
      await cartApi.add({ productId: Number(id), quantity: Math.max(1, qty) });
      showToast('Product added to cart');
    });
  }
};