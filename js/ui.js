var currentRestaurantId = null;
var homeScrollY = 0;
var _menuItemCache = {};
var _homeUrl = location.pathname + location.search + location.hash;

function escHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function handleCardClick(event, id) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }
  event.preventDefault();
  showRestaurant(id);
  return false;
}

function handleDirectionsClick(event, el) {
  event.preventDefault();
  event.stopPropagation();
  window.open(el.getAttribute('data-maps-url'), '_blank', 'noopener');
}

function showRestaurant(id) {
  var d = null;
  if (window.allRestaurants) {
    for (var i = 0; i < window.allRestaurants.length; i++) {
      if (window.allRestaurants[i].id === id) { d = window.allRestaurants[i]; break; }
    }
  }
  if (!d) { showToast('Tap "Get Directions" on the card to find this restaurant'); return; }
  if (d.profile_url) { window.location.href = d.profile_url; return; }
  currentRestaurantId = id;
  homeScrollY = window.scrollY;
  var lang = currentLang || 'en';
  var t = (i18n && i18n[lang]) ? i18n[lang] : {};

  document.getElementById('rp-hero').style.backgroundImage = "url('" + d.image_url + "')";
  document.getElementById('rp-name').textContent = (lang === 'zh' && d.name_zh) ? d.name_zh : d.name;
  document.getElementById('rp-cuisine').textContent = (lang === 'zh' && d.cuisine_zh) ? d.cuisine_zh : d.cuisine;
  document.getElementById('rp-rating-num').textContent = d.rating;
  document.getElementById('rp-review-count').textContent = d.review_count || '200+ reviews';

  var tagLabels = {
    dine: t.tag_dine || '🪑 Dine-in',
    pickup: t.tag_pickup || '📦 Pickup',
    delivery: t.tag_delivery || '🛵 Delivery'
  };
  var tagClasses = {dine:'tag-dine', pickup:'tag-pickup', delivery:'tag-delivery'};
  document.getElementById('rp-tags').innerHTML = d.tags.map(function(tag){
    return '<span class="tag '+( tagClasses[tag]||'')+'">'+escHtml(tagLabels[tag]||tag)+'</span>';
  }).join('');

  document.getElementById('rp-actions').innerHTML =
    '<button class="rp-action-btn btn-reserve" onclick="showToast(\'🗓 Reservation request sent!\')">🗓 '+(t.rp_reserve||'Reserve a Table')+'</button>' +
    '<button class="rp-action-btn btn-pickup" onclick="openCart()">📦 '+(t.rp_pickup||'Order Pickup')+'</button>' +
    '<button class="rp-action-btn btn-delivery" onclick="showToast(\'🛵 Redirecting to delivery...\')">🛵 '+(t.rp_delivery||'Delivery')+'</button>' +
    '<button class="rp-action-btn" onclick="window.open(\'https://line.me/ti/p/@chrixx7\')" style="background:#25d366;color:#fff;">✏️ '+(t.rp_updatemenu||'Update Menu')+'</button>';

  document.getElementById('rp-info-grid').innerHTML =
    '<div class="rp-info-card"><div class="rp-info-label">'+(t.rp_loc||'📍 Location')+'</div><div class="rp-info-val">'+escHtml(d.address)+'</div></div>' +
    '<div class="rp-info-card"><div class="rp-info-label">'+(t.rp_hours||'🕐 Hours')+'</div><div class="rp-info-val">'+escHtml(d.hours)+'</div></div>' +
    '<div class="rp-info-card"><div class="rp-info-label">'+(t.rp_price_range||'💰 Price Range')+'</div><div class="rp-info-val">'+escHtml(d.price_range)+'</div></div>' +
    '<div class="rp-info-card"><div class="rp-info-label">'+(t.rp_phone||'📞 Phone')+'</div><div class="rp-info-val">'+escHtml(d.phone||'—')+'</div></div>' +
    '<div class="rp-info-card"><div class="rp-info-label">'+(t.rp_mrt||'🚇 MRT')+'</div><div class="rp-info-val">'+escHtml(d.mrt)+'</div></div>' +
    '<div class="rp-info-card"><div class="rp-info-label">'+(t.rp_languages||'🌐 Languages')+'</div><div class="rp-info-val">中文 · English · Français<br>日本語 · Español</div></div>';

  var menuItems = d.menu || [];
  _menuItemCache = {};
  menuItems.forEach(function(m, i) {
    _menuItemCache['mi_'+i] = {restaurantId: d.id, restaurantName: d.name, name: m.name, price: m.price, emoji: m.emoji || '🍽️'};
  });
  document.getElementById('rp-menu-items').innerHTML = menuItems.map(function(m, i){
    return '<div class="menu-item"><div class="menu-item-emoji">'+escHtml(m.emoji)+'</div><div class="menu-item-info"><div class="menu-item-name">'+escHtml(m.name)+'</div><div class="menu-item-desc">'+escHtml(m.desc)+'</div></div><div class="menu-item-price">'+escHtml(m.price)+'</div><button class="menu-item-add" data-mikey="mi_'+i+'" onclick="addToCartFromKey(this)">+</button></div>';
  }).join('');

  var revList = d.reviews || [];
  document.getElementById('rp-reviews').innerHTML = revList.map(function(r){
    return '<div class="review-card"><div class="review-top"><div class="review-avatar">'+escHtml(r.initial)+'</div><div><div class="review-name">'+escHtml(r.name)+'</div><div class="review-date">'+escHtml(r.date)+'</div></div><div class="review-stars">'+escHtml(r.stars)+'</div></div><div class="review-text">'+escHtml(r.text)+'</div></div>';
  }).join('');

  document.getElementById('home-page').style.display = 'none';
  document.getElementById('restaurant-page').style.display = 'block';
  window.scrollTo({top:0,behavior:'smooth'});
  if (d.slug) history.pushState(null, '', '/restaurant/'+d.slug+'/');
}

function showHome() {
  document.getElementById('restaurant-page').style.display = 'none';
  document.getElementById('home-page').style.display = 'block';
  window.scrollTo({top: homeScrollY, behavior: 'smooth'});
  if (location.pathname.indexOf('/restaurant/') === 0) {
    history.replaceState(null, '', _homeUrl);
  }
}

window.addEventListener('popstate', function() {
  var restaurantPage = document.getElementById('restaurant-page');
  if (restaurantPage && restaurantPage.style.display !== 'none') {
    showHome();
  }
});

function showHiddenGems() { window.open('https://www.instagram.com/tastytaipei_com','_blank'); }

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 2600);
}

function requestNearMe() {
  if (!navigator.geolocation) { showToast('Location not supported on this browser'); return; }
  showToast('⏳ Getting your location…');
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude.toFixed(5);
      var lng = pos.coords.longitude.toFixed(5);
      window.open('https://www.google.com/maps/search/restaurants/@' + lat + ',' + lng + ',15z', '_blank', 'noopener');
    },
    function(err) {
      if (err.code === 1) { showToast('Tap "Allow" when Safari asks for your location'); }
      else if (err.code === 2) { showToast('Could not determine location — try again'); }
      else { showToast('Location request timed out — try again'); }
    },
    { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false }
  );
}

function toggleMobileNav(){
  var panel=document.getElementById('mobile-nav-panel');
  var btn=document.getElementById('nav-hamburger-btn');
  var nav=document.querySelector('nav');
  if (nav) panel.style.top = nav.getBoundingClientRect().bottom + 'px';
  var open=panel.classList.toggle('open');
  btn.textContent=open?'✕':'☰';
  btn.setAttribute('aria-expanded',open?'true':'false');
}

function closeNavPanel(){
  var panel=document.getElementById('mobile-nav-panel');
  var btn=document.getElementById('nav-hamburger-btn');
  panel.classList.remove('open');
  btn.textContent='☰';
  btn.setAttribute('aria-expanded','false');
}

function toggleMobileFilters(){
  var bar=document.getElementById('filter-bar');
  var btn=document.getElementById('filter-toggle-btn');
  var open=bar.classList.toggle('filters-open');
  btn.textContent=open?'Filters ▲':'Filters ▾';
}
