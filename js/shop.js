/* Shop page logic: localStorage cart + qty badges */
const CART_KEY = 'museumCartV1';

function readCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}
function writeCart(arr){
  localStorage.setItem(CART_KEY, JSON.stringify(arr));
}

function money(n){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n); }

function addToCartFromEl(card){
  const id   = card.dataset.id;
  const name = card.dataset.name;
  const img  = card.dataset.img;
  const price= parseFloat(card.dataset.price);

  const cart = readCart();
  const found = cart.find(it => it.id === id);
  if(found){
    found.qty += 1;
  }else{
    cart.push({ id, name, unitPrice: price, qty: 1, img });
  }
  writeCart(cart);
  syncQtyBadges();
}

function syncQtyBadges(){
  const cart = readCart();
  document.querySelectorAll('.souvenir-item').forEach(card=>{
    const id = card.dataset.id;
    const badge = card.querySelector('.qty-badge');
    const found = cart.find(it => it.id === id);
    badge.textContent = found ? `Qty: ${found.qty}` : '';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // show prices
  document.querySelectorAll('[data-price]').forEach(el=>{
    const price = parseFloat(el.closest('.souvenir-item').dataset.price);
    el.textContent = `Price: ${money(price)}`;
  });

  // wire up add buttons
  document.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', () => addToCartFromEl(btn.closest('.souvenir-item')));
  });

  syncQtyBadges();
});


