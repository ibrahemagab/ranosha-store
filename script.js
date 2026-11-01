// المنتجات من الادمن او من products.js
let customProducts = [];
try{
  customProducts = JSON.parse(localStorage.getItem('ranosha-products') || '[]');
}catch(e){ customProducts = []; }

let productsData = (customProducts && customProducts.length > 0)? customProducts : (typeof products!== 'undefined'? products : []);

let cart = [];
try{
  const c1 = localStorage.getItem('cart');
  const c2 = localStorage.getItem('ranosha-cart');
  cart = JSON.parse(c1 || c2 || '[]');
}catch(e){ cart = []; }

let currentFilter = 'all';
let currentSearch = '';
let currentPrice = 'all';

// Wishlist logic - same as wishlist.html
function getCurrentUserForWish(){
  try{ return JSON.parse(localStorage.getItem('ranosha-current-user')||'null')}catch{return null}
}
function getWishKey(){ 
  const u=getCurrentUserForWish(); 
  return u&&u.email ? 'ranosha-wish-'+u.email.toLowerCase() : 'ranosha-wish-guest'; 
}
function getWish(){ 
  try{ return JSON.parse(localStorage.getItem(getWishKey())||'[]'); }catch{return []}
}
function isWished(id){
  const wish = getWish();
  return wish.includes(id) || wish.includes(String(id));
}
function toggleWish(id, event){
  if(event){ event.preventDefault(); event.stopPropagation(); }
  let wish = getWish();
  const idStr = String(id);
  if(wish.includes(id) || wish.includes(idStr)){
    wish = wish.filter(x=> String(x)!==idStr);
  } else {
    wish.push(idStr);
  }
  localStorage.setItem(getWishKey(), JSON.stringify(wish));
  renderProducts(getFiltered());
  updateWishCount();
}

function updateWishCount(){
  const wish = getWish();
  const el = document.getElementById('wish-count');
  if(el) el.textContent = wish.length;
}

function updateCartCount(){
  const count = cart.reduce((a,c)=>a+c.qty,0);
  document.querySelectorAll('#cart-count').forEach(el=> el.textContent = count);
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
  localStorage.setItem('ranosha-cart', JSON.stringify(cart));
  updateCartCount();
}

function renderProducts(list){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  if(!list || list.length === 0){
    grid.innerHTML = '<div class="col-span-2 text-center py-10 text-gray-500">مفيش منتجات</div>';
    return;
  }
  grid.innerHTML = list.map(p=>{
    const img = p.image || p.img || (p.images? p.images[0] : 'https://via.placeholder.com/150');
    const rating = p.rating || 4.8;
    const reviews = p.reviews || 0;
    const oldPrice = p.oldPrice || null;
    const price = p.price || 0;
    const stock = (p.stock !== undefined && p.stock !== null) ? Number(p.stock) : 10;
    const isOut = stock <= 0;
    const wished = isWished(p.id || p.firebaseId);
    
    // حساب الخصم
    let discount = p.discount || null;
    if(!discount && oldPrice && oldPrice > price){
      discount = Math.round(((oldPrice - price) / oldPrice) * 100);
    }
    
    return `
    <div class="bg-white rounded-2xl p-2 shadow-sm border border-pink-50 relative overflow-hidden ${isOut ? 'opacity-70' : ''}" style="background:#fff!important">
      <!-- صورة المنتج -->
      <div class="relative">
        <a href="product.html?id=${p.id || p.firebaseId}">
          <img src="${img}" class="w-full h-[130px] object-contain rounded-xl ${isOut ? 'grayscale' : ''}" style="background:#fff8f9!important">
        </a>
        
        ${discount ? `<div class="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">-${discount}%</div>` : ''}
        
        <button onclick="toggleWish('${p.id || p.firebaseId}', event)" class="absolute top-1 left-1 w-7 h-7 rounded-full flex items-center justify-center text-[13px] shadow-sm border ${wished ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-400 border-gray-100'}" style="backdrop-filter:blur(4px)">
          ${wished ? '❤️' : '🤍'}
        </button>
        
        ${isOut ? `<div class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl"><span class="bg-black text-white text-[11px] font-bold px-3 py-1.5 rounded-full">نفذت الكمية 😔</span></div>` : ''}
      </div>
      
      <div class="flex items-center gap-1 mt-1">
        <span class="text-[10px] text-amber-400">★</span>
        <span class="text-[10px] font-bold" style="color:#000!important">${rating}</span>
        <span class="text-[10px]" style="color:#999!important">(${reviews})</span>
      </div>
      <h4 class="text-[12px] font-bold mt-1 line-clamp-2 h-[34px]" style="color:#000!important">${p.name}</h4>
      
      <div class="flex items-center gap-2 mt-1">
        <p class="font-extrabold text-sm" style="color:#ff2e78!important">${price} جنيه</p>
        ${oldPrice && oldPrice > price ? `<p class="text-[11px] text-gray-400 line-through">${oldPrice} جنيه</p>` : ''}
      </div>
      
      ${isOut ? 
        `<button disabled class="w-full mt-2 bg-gray-200 text-gray-500 text-[11px] py-2 rounded-full cursor-not-allowed">غير متاح حالياً</button>` :
        `<button onclick="addToCart('${p.id || p.firebaseId}')" class="w-full mt-2 bg-black text-white text-[11px] py-2 rounded-full hover:bg-pink-600 transition">أضف للسلة</button>`
      }
    </div>
    `;
  }).join('');
}

function getFiltered(){
  let list = [...productsData];
  if(currentFilter!== 'all') list = list.filter(p => p.category === currentFilter);
  if(currentSearch){
    const s = currentSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(s));
  }
  if(currentPrice!== 'all'){
    const [min,max] = currentPrice.split('-').map(Number);
    list = list.filter(p => p.price >= min && p.price <= max);
  }
  return list;
}

function filterCat(cat){ currentFilter = cat; renderProducts(getFiltered()); document.querySelector('.products')?.scrollIntoView({behavior:'smooth'}); }
function searchProducts(){ currentSearch = document.getElementById('searchInput')?.value.trim() || ''; renderProducts(getFiltered()); }
function filterByPrice(){ currentPrice = document.getElementById('priceRange')?.value || 'all'; renderProducts(getFiltered()); }

function addToCart(id){
  const prod = productsData.find(p=> String(p.id)==String(id) || String(p.firebaseId)==String(id));
  if(!prod) return;
  const stock = (prod.stock !== undefined && prod.stock !== null) ? Number(prod.stock) : 10;
  if(stock <= 0){
    alert('عذراً، المنتج ده نفذت كميته 😔');
    return;
  }
  const found = cart.find(c=> String(c.id)==String(id) || String(c.firebaseId)==String(id));
  const img = prod.image || prod.img || (prod.images? prod.images[0] : '');
  if(found){
    if(found.qty >= stock){
      alert('وصلتي للحد الأقصى من الكمية المتاحة');
      return;
    }
    found.qty++;
  } else {
    cart.push({...prod, qty:1, id: id, image: img});
  }
  saveCart();
  const btn = event?.target;
  if(btn){ const t=btn.innerText; btn.innerText='تم ✅'; setTimeout(()=>btn.innerText=t,800); }
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts(productsData);
  updateCartCount();
  updateWishCount();
  if(!localStorage.getItem('ranosha-theme')) localStorage.setItem('ranosha-theme','light');
});

window.filterCat = filterCat;
window.addToCart = addToCart;
window.searchProducts = searchProducts;
window.filterByPrice = filterByPrice;
window.toggleWish = toggleWish;
