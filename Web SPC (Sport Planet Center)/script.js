let menu = document.querySelector('#menu-bar');
let navbar = document.querySelector('.navbar');
let themeToggle = document.querySelector('#theme-toggle');

if (themeToggle) {
  let savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.classList.remove('fa-moon');
    themeToggle.classList.add('fa-sun');
  }

  themeToggle.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.toggle('dark');
    let isDark = document.body.classList.contains('dark');
    themeToggle.classList.toggle('fa-sun', isDark);
    themeToggle.classList.toggle('fa-moon', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

menu.onclick = () =>{
  menu.classList.toggle('fa-times');
  navbar.classList.toggle('active');
}

window.onscroll = () =>{
  menu.classList.remove('fa-times');
  navbar.classList.remove('active');
}

let slides = document.querySelectorAll('.slide-container');
let index = 0;

function next(){
  slides[index].classList.remove('active');
  index = (index + 1) % slides.length;
  slides[index].classList.add('active');
}

function prev(){
  slides[index].classList.remove('active');
  index = (index - 1 + slides.length) % slides.length;
  slides[index].classList.add('active');
}

document.querySelectorAll('.featured-image-1').forEach(image_1 =>{
  image_1.addEventListener('click', () =>{
    var src = image_1.getAttribute('src');
    document.querySelector('.big-image-1').src = src;
  });
});

document.querySelectorAll('.featured-image-2').forEach(image_2 =>{
  image_2.addEventListener('click', () =>{
    var src = image_2.getAttribute('src');
    document.querySelector('.big-image-2').src = src;
  });
});

document.querySelectorAll('.featured-image-3').forEach(image_3 =>{
  image_3.addEventListener('click', () =>{
    var src = image_3.getAttribute('src');
    document.querySelector('.big-image-3').src = src;
  });
});

const CART_KEY = 'spc_cart';
const SHIPPING_FEE = 25000;

function readCart(){
  try{
    let data = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(data) ? data : [];
  }catch (err){
    return [];
  }
}

function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function parseRupiah(value){
  let digits = String(value || '').replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatRupiah(amount){
  return 'Rp' + Number(amount || 0).toLocaleString('id-ID');
}

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    let name = button.dataset.name || 'produk';
    let image = button.dataset.image || '';
    let desc = button.dataset.desc || '';
    let price = parseRupiah(button.dataset.price || 0);
    let id = `${name}::${image}`;

    let items = readCart();
    let existing = items.find((item) => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({ id, name, price, image, desc, qty: 1 });
    }
    saveCart(items);
  });
});

function renderCart(){
  let itemsEl = document.getElementById('cart-items');
  if (!itemsEl) return;

  let emptyEl = document.getElementById('cart-empty');
  let items = readCart();

  itemsEl.querySelectorAll('.cart-row:not(.cart-header)').forEach((row) => row.remove());

  if (items.length === 0){
    if (!emptyEl){
      emptyEl = document.createElement('p');
      emptyEl.id = 'cart-empty';
      emptyEl.className = 'cart-empty';
      emptyEl.textContent = 'Keranjang masih kosong. Yuk belanja dulu!';
      itemsEl.appendChild(emptyEl);
    } else {
      emptyEl.style.display = 'block';
    }
  } else if (emptyEl){
    emptyEl.style.display = 'none';
  }

  let subtotal = 0;

  items.forEach((item) => {
    let row = document.createElement('div');
    row.className = 'cart-row';
    row.dataset.id = item.id;

    let rowSubtotal = item.price * item.qty;
    subtotal += rowSubtotal;

    row.innerHTML = `
      <div class="cart-col product">
        ${item.image ? `<img src="${item.image}" alt="">` : ''}
        <div>
          <h3>${item.name}</h3>
          <p>${item.desc || ''}</p>
          <a href="#" class="remove">hapus</a>
        </div>
      </div>
      <div class="cart-col price">${formatRupiah(item.price)}</div>
      <div class="cart-col qty">
        <button class="qty-btn" data-action="dec">-</button>
        <input type="number" value="${item.qty}" min="1">
        <button class="qty-btn" data-action="inc">+</button>
      </div>
      <div class="cart-col subtotal">${formatRupiah(rowSubtotal)}</div>
    `;
    itemsEl.appendChild(row);
  });

  let subtotalEl = document.getElementById('cart-subtotal');
  let shippingEl = document.getElementById('cart-shipping');
  let totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = formatRupiah(subtotal);
  if (shippingEl) shippingEl.textContent = formatRupiah(items.length ? SHIPPING_FEE : 0);
  if (totalEl) totalEl.textContent = formatRupiah(subtotal + (items.length ? SHIPPING_FEE : 0));
}

function updateCartItem(id, qty){
  let items = readCart();
  let item = items.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, qty);
  saveCart(items);
  renderCart();
}

function removeCartItem(id){
  let items = readCart().filter((i) => i.id !== id);
  saveCart(items);
  renderCart();
}

let cartItemsEl = document.getElementById('cart-items');
if (cartItemsEl){
  cartItemsEl.addEventListener('click', (event) => {
    let target = event.target;
    if (target.classList.contains('remove')){
      event.preventDefault();
      let row = target.closest('.cart-row');
      if (row) removeCartItem(row.dataset.id);
    }

    if (target.classList.contains('qty-btn')){
      let row = target.closest('.cart-row');
      if (!row) return;
      let input = row.querySelector('input[type="number"]');
      let current = parseInt(input.value || '1', 10);
      let next = target.dataset.action === 'inc' ? current + 1 : current - 1;
      updateCartItem(row.dataset.id, next);
    }
  });

  cartItemsEl.addEventListener('change', (event) => {
    let target = event.target;
    if (target.matches('input[type="number"]')){
      let row = target.closest('.cart-row');
      if (!row) return;
      let value = parseInt(target.value || '1', 10);
      updateCartItem(row.dataset.id, value);
    }
  });

  renderCart();
}
