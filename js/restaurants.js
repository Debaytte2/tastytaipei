var activeFilters = {};

function hasRealPhoto(r) {
  return !!(r.image_url && (r.image_url.indexOf('restaurant-photos') !== -1 || r.image_url.indexOf('images.unsplash.com') !== -1));
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
  var html = '';
  restaurants.forEach(function(r) {
    var name = (lang === 'zh' && r.name_zh) ? r.name_zh : r.name;
    var cuisine = (lang === 'zh' && r.cuisine_zh) ? r.cuisine_zh : r.cuisine;
    var imgHtml = hasRealPhoto(r)
      ? '<img src="'+escHtml(r.image_url)+'" alt="'+escHtml(name)+'" loading="lazy" referrerpolicy="no-referrer" onload="this.classList.add(\'r-img-loaded\')" onerror="this.classList.add(\'r-img-loaded\')"/>'
      : '<div class="r-card-img-empty">🍽</div>';
    var subline = (lang !== 'zh' && r.name_zh) ? (r.name_zh + ' · ' + r.district) : r.district;
    html += '<a class="r-card" href="/restaurant/'+r.slug+'/" onclick="return handleCardClick(event,\''+r.id+'\')">' +
      '<div class="r-card-img">'+imgHtml+'<div class="r-card-tag">'+escHtml(cuisine)+'</div></div>' +
      '<div class="r-card-body">' +
        '<div class="r-card-top"><div class="r-card-name">'+escHtml(name)+'</div><div class="r-rating">⭐ '+r.rating+'</div></div>' +
        '<div class="r-cuisine">'+escHtml(subline)+'</div>' +
        '<div class="r-meta"><span class="r-district">'+escHtml(r.review_count||'')+'</span><span>'+escHtml(r.price_range)+'</span></div>' +
      '</div></a>';
  });
  grid.innerHTML = html;
}

function updateVerifiedBadge(count) {
  var el = document.getElementById('verified-badge');
  if (!el) return;
  var lang = currentLang || 'en';
  var t = (i18n && i18n[lang]) ? i18n[lang] : {};
  el.innerHTML = '✓ ' + count + ' ' + (t.hero_badge_suffix || 'spots verified');
}

function renderSpotlight(restaurants) {
  var withDesc = (restaurants || []).filter(function(r){ return r.description; });
  if (!withDesc.length) return;
  withDesc.sort(function(a,b){ return b.rating - a.rating; });
  var r = withDesc[0];
  var lang = currentLang || 'en';
  var t = (i18n && i18n[lang]) ? i18n[lang] : {};
  var name = (lang === 'zh' && r.name_zh) ? r.name_zh : r.name;
  var img = document.getElementById('spotlight-img');
  var titleEl = document.getElementById('spotlight-title');
  var descEl = document.getElementById('spotlight-desc');
  var linkEl = document.getElementById('spotlight-link');
  if (img) img.style.backgroundImage = "url('" + r.image_url + "')";
  if (titleEl) titleEl.textContent = name + ' — ' + r.cuisine + ', ' + r.district;
  if (descEl) {
    var langNote = (lang !== 'en') ? ' <span style="font-size:11px;opacity:.6;font-style:italic;">[EN]</span>' : '';
    descEl.innerHTML = escHtml(r.description) + langNote;
  }
  if (linkEl) { linkEl.href = '/restaurant/' + r.slug + '/'; linkEl.textContent = t.spotlight_cta || "Read the full write-up →"; }
}

function chipClick(el) {
  var cat = el.getAttribute('data-cat');
  if (!cat) { clearCategoryFilter(); return; }
  filterByCategory(cat, el.textContent.trim());
}

function heroSearch() {
  var cuisine = document.getElementById('hero-cuisine').value;
  var district = document.getElementById('hero-district').value;
  var q = document.getElementById('hero-search-input').value;
  document.getElementById('searchInput').value = q;
  if (cuisine) { activeFilters.category = cuisine; activeFilters.categoryLabel = cuisine; }
  else { delete activeFilters.category; delete activeFilters.categoryLabel; }
  if (district) { activeFilters.district = district; } else { delete activeFilters.district; }
  document.querySelectorAll('.chip').forEach(function(c) {
    c.classList.toggle('on', c.getAttribute('data-cat') === cuisine);
  });
  document.querySelectorAll('.district-card').forEach(function(c){
    c.classList.toggle('active', c.getAttribute('data-district') === district);
  });
  updateToppicksTitle();
  document.getElementById('clear-filters').style.display = (cuisine || district || q) ? 'inline-flex' : 'none';
  applyFilters();
  scrollToGrid();
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

function updateToppicksTitle() {
  var title = document.getElementById('toppicks-title');
  if (!title) return;
  var label = activeFilters.categoryLabel;
  var district = activeFilters.district;
  if (label && district) title.textContent = label + ' in ' + district;
  else if (label) title.textContent = label;
  else if (district) title.textContent = district + ' Restaurants';
  else if (i18n[currentLang]) title.textContent = i18n[currentLang].sec_toppicks || 'Freshly Verified';
}

function filterByCategory(cat, label) {
  activeFilters.category = cat;
  activeFilters.categoryLabel = label;
  document.querySelectorAll('.chip').forEach(function(c) {
    c.classList.toggle('on', c.getAttribute('data-cat') === cat);
  });
  updateToppicksTitle();
  document.getElementById('clear-filters').style.display = 'inline-flex';
  applyFilters();
  scrollToGrid();
}

function filterByDistrict(district) {
  activeFilters.district = district;
  document.querySelectorAll('.district-card').forEach(function(c){
    c.classList.toggle('active', c.getAttribute('data-district') === district);
  });
  updateToppicksTitle();
  document.getElementById('clear-filters').style.display = 'inline-flex';
  applyFilters();
  var sec = document.getElementById('top-picks-section');
  if (sec) sec.scrollIntoView({behavior:'smooth'});
}

function clearCategoryFilter() {
  delete activeFilters.category;
  delete activeFilters.categoryLabel;
  delete activeFilters.district;
  document.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('on', !c.getAttribute('data-cat')); });
  document.querySelectorAll('.district-card').forEach(function(c){ c.classList.remove('active'); });
  updateToppicksTitle();
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
    btn.style.borderColor = '#D6402E';
  }
}

function selectFilter(type, val, el) {
  var dd = el.closest('.filter-dropdown');
  dd.querySelectorAll('.filter-option').forEach(function(o){ o.classList.remove('selected'); });
  el.classList.add('selected');
  dd.classList.remove('open'); dd.style.display='none';
  activeFilters[type] = val;
  var btn = dd.previousElementSibling;
  btn.style.background='#14213D'; btn.style.color='#FBF3E3'; btn.style.borderColor='#14213D';
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
  document.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('on', !c.getAttribute('data-cat')); });
  document.querySelectorAll('.district-card').forEach(function(c){ c.classList.remove('active'); });
  var title = document.getElementById('toppicks-title');
  if (title && i18n[currentLang]) title.textContent = i18n[currentLang].sec_toppicks || 'Freshly Verified';
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
