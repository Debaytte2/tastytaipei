var cart = [];

function addToCartFromKey(btn) {
  var key = btn.getAttribute('data-mikey');
  var item = _menuItemCache[key];
  if (!item) return;
  addToCart(item.restaurantId, item.restaurantName, item.name, item.price, item.emoji);
}

function addToCart(restaurantId, restaurantName, itemName, itemPrice, itemEmoji) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].restaurantId === restaurantId && cart[i].name === itemName) {
      cart[i].qty += 1;
      saveCart(); updateCartUI();
      showToast((itemEmoji || '') + ' ' + itemName + ' ×' + cart[i].qty + ' 🛒');
      return;
    }
  }
  var priceMatch = (itemPrice || '').match(/\d+/);
  var priceNum = priceMatch ? parseInt(priceMatch[0]) : 0;
  cart.push({restaurantId:restaurantId,restaurantName:restaurantName,name:itemName,price:itemPrice,priceNum:priceNum,emoji:itemEmoji||'🍽️',qty:1});
  saveCart(); updateCartUI();
  showToast((itemEmoji || '') + ' Added to cart 🛒');
}

function saveCart() { localStorage.setItem('tt_cart', JSON.stringify(cart)); }

function getCartTotal() { return cart.reduce(function(s,item){return s+item.qty*item.priceNum;},0); }

function updateCartUI() {
  var total = cart.reduce(function(s,item){return s+item.qty;},0);
  var badge = document.getElementById('cart-badge');
  if (badge) { badge.textContent = total; badge.style.display = total > 0 ? 'flex' : 'none'; }
}

function updateCartQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart(); updateCartUI(); renderCartItems();
}

function renderCartItems() {
  var el = document.getElementById('cart-items');
  var footer = document.getElementById('cart-footer');
  if (!el) return;
  if (cart.length === 0) {
    el.innerHTML = '<div class="cart-empty"><div style="font-size:48px;margin-bottom:12px;">🛒</div><div style="font-weight:600;">Your cart is empty</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">Open a restaurant and tap + to add items</div></div>';
    if (footer) footer.style.display = 'none';
    return;
  }
  if (footer) footer.style.display = 'block';
  var html = '';
  cart.forEach(function(item, idx) {
    html += '<div class="cart-item">' +
      '<div class="cart-item-emoji">'+escHtml(item.emoji)+'</div>' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">'+escHtml(item.name)+'</div>' +
        '<div class="cart-item-sub">'+escHtml(item.restaurantName)+'</div>' +
        '<div class="cart-item-price">'+escHtml(item.price)+'</div>' +
      '</div>' +
      '<div class="cart-item-controls">' +
        '<button class="cart-qty-btn" onclick="updateCartQty('+idx+',-1)">−</button>' +
        '<span class="cart-qty-num">'+item.qty+'</span>' +
        '<button class="cart-qty-btn" onclick="updateCartQty('+idx+',1)">+</button>' +
      '</div>' +
    '</div>';
  });
  el.innerHTML = html;
  var sub = document.getElementById('cart-subtotal');
  if (sub) sub.textContent = 'NT$' + getCartTotal();
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').style.display = 'none';
  document.body.style.overflow = '';
}

function showPickupForm() {
  var summaryEl = document.getElementById('pickup-summary-items');
  if (summaryEl) {
    summaryEl.innerHTML = cart.map(function(item) {
      return '<div class="pickup-summary-item"><span>'+escHtml(item.qty+'× '+item.name)+'</span><span style="flex-shrink:0;font-weight:600;">'+escHtml(item.price)+'</span></div>';
    }).join('');
  }
  var totEl = document.getElementById('pickup-summary-total');
  if (totEl) totEl.textContent = 'NT$' + getCartTotal();
  document.getElementById('cart-items-view').style.display = 'none';
  var pv = document.getElementById('pickup-form-view');
  pv.style.display = 'flex';
}

function hidePickupForm() {
  document.getElementById('pickup-form-view').style.display = 'none';
  document.getElementById('cart-items-view').style.display = 'flex';
}

function submitPickupOrder() {
  var name = document.getElementById('pickup-name').value.trim();
  var phone = document.getElementById('pickup-phone').value.trim();
  var time = document.getElementById('pickup-time').value.trim();
  if (!name || !phone || !time) { showToast('Please fill in all fields ⚠️'); return; }
  var restaurantName = cart.length > 0 ? cart[0].restaurantName : 'Unknown';
  var itemsText = cart.map(function(item){ return item.qty+'× '+item.name+' ('+item.price+')'; }).join('\n');
  var btn = document.getElementById('submit-pickup-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
  fetch('https://formspree.io/f/mdapwalg', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      _subject: 'Pickup Order — ' + restaurantName,
      customer_name: name,
      phone: phone,
      pickup_time: time,
      restaurant: restaurantName,
      items: itemsText,
      total: 'NT$' + getCartTotal(),
      order_date: new Date().toLocaleString('en-GB', {timeZone: 'Asia/Taipei'})
    })
  })
  .then(function(res) {
    if (!res.ok) throw new Error('fail');
    document.getElementById('pickup-form-view').style.display = 'none';
    document.getElementById('pickup-confirm-view').style.display = 'flex';
    cart = []; saveCart(); updateCartUI();
  })
  .catch(function() {
    if (btn) { btn.disabled = false; btn.textContent = 'Place Pickup Order 📦'; }
    showToast('Could not submit order — please try again ⚠️');
  });
}

function resetCartDrawer() {
  closeCart();
  setTimeout(function() {
    document.getElementById('pickup-form-view').style.display = 'none';
    document.getElementById('pickup-confirm-view').style.display = 'none';
    document.getElementById('cart-items-view').style.display = 'flex';
    document.getElementById('pickup-name').value = '';
    document.getElementById('pickup-phone').value = '';
    document.getElementById('pickup-time').value = '';
    var btn = document.getElementById('submit-pickup-btn');
    if (btn) { btn.disabled = false; btn.textContent = 'Place Pickup Order 📦'; }
  }, 400);
}
