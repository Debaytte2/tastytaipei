var activeFilters = {};

var _CUISINE_IMG_POOLS = {
  noodles: ['https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&h=600&fit=crop&q=80&fm=jpg'],
  dumplings: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80&fm=jpg'],
  taiwanese: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=800&h=600&fit=crop&q=80&fm=jpg'],
  brunch: ['https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&h=600&fit=crop&q=80&fm=jpg'],
  seafood: ['https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1498579687804-55501e2a8571?w=800&h=600&fit=crop&q=80&fm=jpg'],
  japanese: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1498579687804-55501e2a8571?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?w=800&h=600&fit=crop&q=80&fm=jpg'],
  cafe: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80&fm=jpg'],
  steak: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80&fm=jpg'],
  french: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop&q=80&fm=jpg'],
  western: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=600&fit=crop&q=80&fm=jpg'],
  default: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop&q=80&fm=jpg','https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80&fm=jpg']
};
var _poolCursors = {};

function getUniqueRestaurantImage(r, usedImages) {
  var url = r.image_url;
  if (url && !usedImages[url]) { usedImages[url] = true; return url; }
  var cats = (r.categories || []).join(' ').toLowerCase();
  var cuisine = (r.cuisine || '').toLowerCase();
  var poolKey = 'default';
  if (cats.indexOf('ramen') !== -1 || cuisine.indexOf('ramen') !== -1) poolKey = 'noodles';
  else if (cats.indexOf('noodle') !== -1 || cuisine.indexOf('noodle') !== -1) poolKey = 'noodles';
  else if (cats.indexOf('dumpling') !== -1 || cats.indexOf('dimsum') !== -1) poolKey = 'dumplings';
  else if (cats.indexOf('brunch') !== -1 || cats.indexOf('breakfast') !== -1) poolKey = 'brunch';
  else if (cats.indexOf('seafood') !== -1 || cats.indexOf('sushi') !== -1) poolKey = 'seafood';
  else if (cats.indexOf('japanese') !== -1) poolKey = 'japanese';
  else if (cats.indexOf('cafe') !== -1) poolKey = 'cafe';
  else if (cats.indexOf('steak') !== -1 || cats.indexOf('bbq') !== -1) poolKey = 'steak';
  else if (cats.indexOf('french') !== -1 || cuisine.indexOf('french') !== -1) poolKey = 'french';
  else if (cats.indexOf('western') !== -1 || cats.indexOf('american') !== -1 || cats.indexOf('italian') !== -1) poolKey = 'western';
  else if (cats.indexOf('taiwanese') !== -1) poolKey = 'taiwanese';
  var pool = _CUISINE_IMG_POOLS[poolKey] || _CUISINE_IMG_POOLS.default;
  var c = _poolCursors[poolKey] || 0;
  var start = c;
  do {
    var candidate = pool[c % pool.length];
    c = (c + 1) % pool.length;
    if (!usedImages[candidate]) { usedImages[candidate] = true; _poolCursors[poolKey] = c; return candidate; }
  } while (c !== start);
  return url || pool[0];
}

function renderRestaurantGrid(restaurants) {
  var grid = document.getElementById('restaurants-grid');
  if (!grid) return;
  var lang = currentLang || 'en';
  var t = (i18n && i18n[lang]) ? i18n[lang] : {};
  if (!restaurants || restaurants.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted);font-size:15px;font-weight:500;">'+(t.card_no_results||'No restaurants match your search. Try different keywords or filters.')+'</div>';
    return;
  }
  var usedImages = {};
  _poolCursors = {};
  var html = '';
  restaurants.forEach(function(r) {
    var name = (lang === 'zh' && r.name_zh) ? r.name_zh : r.name;
    var nameZh = (lang === 'en' && r.name_zh) ? ' <span style="font-size:13px;color:var(--muted);font-family:\'Noto Sans TC\',sans-serif;font-weight:500;">'+escHtml(r.name_zh)+'</span>' : '';
    var cuisine = (lang === 'zh' && r.cuisine_zh) ? r.cuisine_zh : r.cuisine;
    var imgUrl = getUniqueRestaurantImage(r, usedImages);
    var badgeHtml = r.badge ? '<div class="r-card-badge"><span class="tag tag-popular">'+escHtml(r.badge)+'</span></div>' : '';
    var districtBadge = '<span style="display:inline-block;background:var(--warm);border:1px solid var(--border);border-radius:20px;padding:2px 10px;font-size:11px;font-weight:600;color:var(--muted);">📍 '+escHtml(r.district)+'</span>';
    var descLangNote = (lang !== 'en') ? ' <span style="font-size:10px;color:var(--muted);font-style:italic;opacity:.7;">[EN]</span>' : '';
    var desc = r.description ? '<div style="font-size:12px;color:var(--muted);margin-top:8px;line-height:1.5;">'+escHtml(r.description)+descLangNote+'</div>' : '';
    var hours = r.hours ? '<div style="font-size:11px;color:var(--muted);margin-top:6px;">🕐 '+escHtml(r.hours)+'</div>' : '';
    var mapsUrl = r.maps_url || ('https://www.google.com/maps/search/'+encodeURIComponent(r.name+' '+r.district+' Taipei'));
    var dirLabel = t.card_directions || '📍 Get Directions';
    var directionsBtn = '<a href="'+mapsUrl+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:8px 16px;background:var(--ink);color:var(--cream);border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;transition:background .2s;" onmouseover="this.style.background=\'var(--orange)\'" onmouseout="this.style.background=\'var(--ink)\'">'+dirLabel+'</a>';
    html += '<div class="r-card" onclick="showRestaurant(\''+r.id+'\')" style="cursor:pointer;">' +
      '<div class="r-card-img"><img src="'+imgUrl+'" alt="'+escHtml(name)+'" loading="lazy" referrerpolicy="no-referrer" onload="this.classList.add(\'r-img-loaded\')" onerror="this.classList.add(\'r-img-loaded\')"/>'+badgeHtml+'</div>' +
      '<div class="r-card-body">' +
        '<div class="r-card-top"><div><div class="r-card-name">'+escHtml(name)+nameZh+'</div><div class="r-cuisine">'+escHtml(cuisine)+'</div></div><div class="r-rating">⭐ '+r.rating+' <span style="font-size:11px;color:var(--muted);font-weight:400;">('+escHtml(r.review_count)+')</span></div></div>' +
        '<div style="margin-top:8px;">'+districtBadge+'</div>' +
        desc + hours +
        directionsBtn +
      '</div></div>';
  });
  grid.innerHTML = html;
}

function applyFilters() {
  if (!window.allRestaurants) return;
  var query = (document.getElementById('searchInput').value || '').trim().toLowerCase();
  var lang = currentLang || 'en';
  var filtered = window.allRestaurants.filter(function(r) {
    var name = ((lang === 'zh' && r.name_zh) ? r.name_zh : r.name).toLowerCase();
    var cuisine = ((lang === 'zh' && r.cuisine_zh) ? r.cuisine_zh : r.cuisine).toLowerCase();
    var cats = r.categories.join(' ').toLowerCase();
    var searchText = name + ' ' + cuisine + ' ' + cats + ' ' + r.district.toLowerCase() + ' ' + r.price_range.toLowerCase();
    var matchesQuery = !query || searchText.indexOf(query) !== -1;
    var matchesPrice = true;
    if (activeFilters.price) {
      var pm = r.price_min;
      if (activeFilters.price === 'Under NT$150') matchesPrice = pm < 150;
      else if (activeFilters.price === 'NT$150–300') matchesPrice = pm >= 150 && pm < 300;
      else if (activeFilters.price === 'NT$300–600') matchesPrice = pm >= 300 && pm < 600;
      else if (activeFilters.price === 'NT$600+') matchesPrice = pm >= 600;
    }
    var matchesRating = true;
    if (activeFilters.rating && activeFilters.rating !== 'Any') {
      matchesRating = r.rating >= parseFloat(activeFilters.rating);
    }
    var matchesDine = !activeFilters.dine || r.tags.indexOf('dine') !== -1;
    var matchesPickup = !activeFilters.pickup || r.tags.indexOf('pickup') !== -1;
    var matchesDelivery = !activeFilters.delivery || r.tags.indexOf('delivery') !== -1;
    var matchesCuisine = !activeFilters.cuisine || cats.indexOf(activeFilters.cuisine.toLowerCase()) !== -1;
    var matchesCat = !activeFilters.category || cats.indexOf(activeFilters.category.toLowerCase()) !== -1;
    var matchesDistrict = !activeFilters.district || r.district.toLowerCase() === activeFilters.district.toLowerCase();
    return matchesQuery && matchesPrice && matchesRating && matchesDine && matchesPickup && matchesDelivery && matchesCuisine && matchesCat && matchesDistrict;
  });
  var sort = activeFilters.sort || 'Top Rated';
  if (sort === 'Top Rated') {
    filtered.sort(function(a,b){ return b.rating - a.rating; });
  } else if (sort === 'Price: Low') {
    filtered.sort(function(a,b){ return a.price_min - b.price_min; });
  } else if (sort === 'Price: High') {
    filtered.sort(function(a,b){ return b.price_min - a.price_min; });
  } else if (sort === 'Most Popular') {
    filtered.sort(function(a,b){
      var ac = parseInt((a.review_count||'0').replace(/[^0-9]/g,''));
      var bc = parseInt((b.review_count||'0').replace(/[^0-9]/g,''));
      return bc - ac;
    });
  }
  renderRestaurantGrid(filtered);
}

function showAllCategories() {
  clearCategoryFilter();
  scrollToGrid();
}

function scrollToGrid() {
  var grid = document.getElementById('restaurants-grid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleSearchClick() { applyFilters(); scrollToGrid(); }

function searchFor(q) {
  document.getElementById('searchInput').value = q;
  applyFilters();
  scrollToGrid();
}

function activateCat(el) {
  document.querySelectorAll('.menu-cat').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
}

function filterByCategory(cat, label) {
  activeFilters.category = cat;
  delete activeFilters.district;
  document.querySelectorAll('.cat-item').forEach(function(c) {
    var m = (c.getAttribute('onclick') || '').match(/filterByCategory\('([^']+)'/);
    c.classList.toggle('active', !!(m && m[1] === cat));
  });
  document.querySelectorAll('.district-card').forEach(function(c){ c.classList.remove('active'); });
  var title = document.getElementById('toppicks-title');
  if (title && label) title.textContent = label;
  document.getElementById('clear-filters').style.display = 'inline-flex';
  applyFilters();
  scrollToGrid();
}

function filterByDistrict(district) {
  activeFilters.district = district;
  delete activeFilters.category;
  document.querySelectorAll('.cat-item').forEach(function(c){ c.classList.remove('active'); });
  document.querySelectorAll('.district-card').forEach(function(c){
    c.classList.toggle('active', c.getAttribute('data-district') === district);
  });
  var title = document.getElementById('toppicks-title');
  if (title) title.textContent = district + ' Restaurants';
  document.getElementById('clear-filters').style.display = 'inline-flex';
  applyFilters();
  var sec = document.getElementById('top-picks-section');
  if (sec) sec.scrollIntoView({behavior:'smooth'});
}

function clearCategoryFilter() {
  delete activeFilters.category;
  delete activeFilters.district;
  document.querySelectorAll('.cat-item').forEach(function(c){ c.classList.remove('active'); });
  document.querySelectorAll('.district-card').forEach(function(c){ c.classList.remove('active'); });
  var title = document.getElementById('toppicks-title');
  if (title && i18n[currentLang]) title.textContent = i18n[currentLang].sec_toppicks || 'Top Picks Near You';
  applyFilters();
}

function toggleFilter(ddId, btn) {
  var dd = document.getElementById(ddId);
  var isOpen = dd.classList.contains('open');
  document.querySelectorAll('.filter-dropdown').forEach(function(d){ d.classList.remove('open'); d.style.display='none'; });
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.style.borderColor=''; });
  if (!isOpen) {
    var rect = btn.getBoundingClientRect();
    dd.style.display = 'block';
    dd.style.top = (rect.bottom + 6) + 'px';
    dd.style.left = Math.min(rect.left, window.innerWidth - 200) + 'px';
    dd.classList.add('open');
    btn.style.borderColor = '#e8521a';
  }
}

function selectFilter(type, val, el) {
  var dd = el.closest('.filter-dropdown');
  dd.querySelectorAll('.filter-option').forEach(function(o){ o.classList.remove('selected'); });
  el.classList.add('selected');
  dd.classList.remove('open'); dd.style.display='none';
  activeFilters[type] = val;
  var btn = dd.previousElementSibling;
  btn.style.background='#1a1207'; btn.style.color='#fdf8f0'; btn.style.borderColor='#1a1207';
  document.getElementById('clear-filters').style.display = 'inline-flex';
  applyFilters();
}

function toggleServiceFilter(type, btn) {
  btn.classList.toggle('active');
  if (btn.classList.contains('active')) {
    activeFilters[type] = true;
    document.getElementById('clear-filters').style.display = 'inline-flex';
  } else { delete activeFilters[type]; }
  applyFilters();
}

function clearFilters() {
  activeFilters = {};
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); b.style.background=''; b.style.color=''; b.style.borderColor=''; });
  document.querySelectorAll('.filter-option').forEach(function(o){ o.classList.remove('selected'); });
  document.querySelectorAll('.cat-item').forEach(function(c){ c.classList.remove('active'); });
  document.querySelectorAll('.district-card').forEach(function(c){ c.classList.remove('active'); });
  var title = document.getElementById('toppicks-title');
  if (title && i18n[currentLang]) title.textContent = i18n[currentLang].sec_toppicks || 'Top Picks Near You';
  document.getElementById('clear-filters').style.display = 'none';
  applyFilters();
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.filter-wrap')) {
    document.querySelectorAll('.filter-dropdown').forEach(function(d){ d.classList.remove('open'); d.style.display='none'; });
    document.querySelectorAll('.filter-btn').forEach(function(b){ b.style.borderColor=''; });
  }
});

function updateDistrictCounts(restaurants) {
  var counts = {};
  restaurants.forEach(function(r){ counts[r.district] = (counts[r.district]||0)+1; });
  var ids = {
    "Da'an":'dc-count-daan','Xinyi':'dc-count-xinyi','Shilin':'dc-count-shilin',
    'Zhongshan':'dc-count-zhongshan','Zhongzheng':'dc-count-zhongzheng',
    'Wanhua':'dc-count-wanhua','Songshan':'dc-count-songshan','Datong':'dc-count-datong',
    'Beitou':'dc-count-beitou','Neihu':'dc-count-neihu','Nangang':'dc-count-nangang','Wenshan':'dc-count-wenshan'
  };
  Object.keys(ids).forEach(function(d){
    var el = document.getElementById(ids[d]);
    if (el) el.textContent = (counts[d]||0)+' restaurants';
  });
}
