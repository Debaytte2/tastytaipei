var CATS = [
  { key: 'breakfast', tags: ['breakfast'], i18n: 'cat_breakfast' },
  { key: 'brunch', tags: ['brunch'], i18n: 'cat_brunch' },
  { key: 'nightmarket', tags: ['night market'], i18n: 'cat_nightmarket' },
  { key: 'latenight', tags: ['latenight'], i18n: 'cat_latenight' },
  { key: 'taiwanese', tags: ['taiwanese'], i18n: 'cat_taiwanese' },
  { key: 'japanese', tags: ['japanese'], i18n: 'cat_japanese' },
  { key: 'korean', tags: ['korean'], i18n: 'cat_korean' },
  { key: 'chinese', tags: ['chinese'], i18n: 'cat_chinese' },
  { key: 'noodles', tags: ['noodles'], i18n: 'cat_noodles' },
  { key: 'dumplings', tags: ['dumplings'], i18n: 'cat_dumplings' },
  { key: 'hotpot', tags: ['hot pot'], i18n: 'cat_hotpot' },
  { key: 'bbq', tags: ['bbq'], i18n: 'cat_bbq' },
  { key: 'seafood', tags: ['seafood'], i18n: 'cat_seafood' },
  { key: 'western', tags: ['western'], i18n: 'cat_western' },
  { key: 'italian', tags: ['italian'], i18n: 'cat_italian' },
  { key: 'cafe', tags: ['cafe'], i18n: 'cat_cafes' },
  { key: 'bubbletea', tags: ['bubble tea'], i18n: 'cat_bubbletea' },
  { key: 'desserts', tags: ['dessert', 'desserts'], i18n: 'cat_desserts' },
  { key: 'vegetarian', tags: ['vegetarian'], i18n: 'cat_vegetarian' },
  { key: 'streetfood', tags: ['street food'], i18n: 'cat_streetfood' }
];

var DISTRICTS = ["Da'an", 'Xinyi', 'Shilin', 'Zhongshan', 'Zhongzheng', 'Wanhua', 'Songshan', 'Datong', 'Beitou', 'Neihu', 'Nangang', 'Wenshan'];

var filterState = { cuisine: '', district: '', price: '', rating: '' };
var sortBy = 'rating';
var currentPage = 1;
var PAGE_SIZE = 12;

function t() { return (window.i18n && i18n[currentLang]) || {}; }

function catLabel(key) {
  var c = CATS.filter(function (x) { return x.key === key; })[0];
  if (!c) return key;
  return t()[c.i18n] || key;
}

function hasRealPhoto(r) {
  return !!(r.image_url && (r.image_url.indexOf('restaurant-photos') !== -1 || r.image_url.indexOf('images.unsplash.com') !== -1));
}

function matchesCategory(r, key) {
  var c = CATS.filter(function (x) { return x.key === key; })[0];
  if (!c) return false;
  var cats = (r.categories || []).map(function (x) { return x.toLowerCase(); });
  return c.tags.some(function (tag) { return cats.indexOf(tag) !== -1; });
}

function matchesPrice(r, tier) {
  if (!tier) return true;
  var pm = r.price_min;
  if (tier === 'Under NT$150') return pm < 150;
  if (tier === 'NT$150–300') return pm >= 150 && pm < 300;
  if (tier === 'NT$300–600') return pm >= 300 && pm < 600;
  if (tier === 'NT$600+') return pm >= 600;
  return true;
}

function getFiltered() {
  var all = window.allRestaurants || [];
  return all.filter(function (r) {
    var okCuisine = !filterState.cuisine || matchesCategory(r, filterState.cuisine);
    var okDistrict = !filterState.district || r.district === filterState.district;
    var okPrice = matchesPrice(r, filterState.price);
    var okRating = !filterState.rating || r.rating >= parseFloat(filterState.rating);
    return okCuisine && okDistrict && okPrice && okRating;
  });
}

function sortList(list) {
  var copy = list.slice();
  if (sortBy === 'rating') copy.sort(function (a, b) { return b.rating - a.rating; });
  else if (sortBy === 'price-low') copy.sort(function (a, b) { return a.price_min - b.price_min; });
  else if (sortBy === 'price-high') copy.sort(function (a, b) { return b.price_min - a.price_min; });
  else if (sortBy === 'popular') copy.sort(function (a, b) {
    var ac = parseInt((a.review_count || '0').replace(/[^0-9]/g, '')) || 0;
    var bc = parseInt((b.review_count || '0').replace(/[^0-9]/g, '')) || 0;
    return bc - ac;
  });
  return copy;
}

function populateSelects() {
  var lang = t();
  var cSel = document.getElementById('f-cuisine');
  var dSel = document.getElementById('f-district');
  cSel.innerHTML = '<option value="">' + (lang.hero_all_cuisines || 'All Cuisines') + '</option>' +
    CATS.map(function (c) { return '<option value="' + c.key + '">' + escHtml(catLabel(c.key)) + '</option>'; }).join('');
  dSel.innerHTML = '<option value="">' + (lang.hero_all_districts || 'All Districts') + '</option>' +
    DISTRICTS.map(function (d) { return '<option value="' + escHtml(d) + '">' + escHtml(d) + '</option>'; }).join('');
  cSel.value = filterState.cuisine;
  dSel.value = filterState.district;
  document.getElementById('f-price').value = filterState.price;
  document.getElementById('f-rating').value = filterState.rating;
}

function applyFilterBar() {
  filterState.cuisine = document.getElementById('f-cuisine').value;
  filterState.district = document.getElementById('f-district').value;
  filterState.price = document.getElementById('f-price').value;
  filterState.rating = document.getElementById('f-rating').value;
  currentPage = 1;
  render();
}

function clearAllFilters() {
  filterState = { cuisine: '', district: '', price: '', rating: '' };
  currentPage = 1;
  populateSelects();
  render();
}

function removeChip(field) {
  filterState[field] = '';
  currentPage = 1;
  populateSelects();
  render();
}

function railClick(type, value) {
  filterState[type] = (filterState[type] === value) ? '' : value;
  currentPage = 1;
  populateSelects();
  render();
}

function onSortChange() {
  sortBy = document.getElementById('sort-select').value;
  currentPage = 1;
  render();
}

function gotoPage(n) {
  currentPage = n;
  renderGrid();
  renderPagination(getFiltered().length);
  var wrap = document.querySelector('.results-wrap');
  if (wrap) wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPageHead(filtered) {
  var lang = t();
  var h1 = document.getElementById('page-title');
  var sub = document.getElementById('page-subtitle');
  var subtitle = (lang.discover_subtitle_n || '{n} verified spots').replace('{n}', filtered.length);
  if (filterState.cuisine && filterState.district) {
    h1.textContent = catLabel(filterState.cuisine) + ' in ' + filterState.district;
  } else if (filterState.cuisine) {
    h1.textContent = catLabel(filterState.cuisine);
  } else if (filterState.district) {
    h1.textContent = (lang.discover_in_district || 'Restaurants in {d}').replace('{d}', filterState.district);
  } else {
    h1.textContent = lang.discover_all_title || 'All Restaurants';
  }
  sub.textContent = subtitle;
}

function renderActiveChips() {
  var lang = t();
  var wrap = document.getElementById('active-filters');
  var chips = [];
  if (filterState.cuisine) chips.push({ field: 'cuisine', label: catLabel(filterState.cuisine) });
  if (filterState.district) chips.push({ field: 'district', label: filterState.district });
  if (filterState.price) chips.push({ field: 'price', label: lang[{ 'Under NT$150': 'f_p1', 'NT$150–300': 'f_p2', 'NT$300–600': 'f_p3', 'NT$600+': 'f_p4' }[filterState.price]] || filterState.price });
  if (filterState.rating) chips.push({ field: 'rating', label: filterState.rating + '+' });
  wrap.innerHTML = chips.map(function (c) {
    return '<div class="active-chip">' + escHtml(c.label) + ' <button onclick="removeChip(\'' + c.field + '\')" aria-label="Remove filter">×</button></div>';
  }).join('');
}

function renderSidebar(filtered) {
  var lang = t();
  var allForCounts = window.allRestaurants || [];
  var cuisineRail = document.getElementById('rail-cuisines');
  cuisineRail.innerHTML = CATS.map(function (c) {
    var count = allForCounts.filter(function (r) {
      return matchesCategory(r, c.key) && (!filterState.district || r.district === filterState.district) && matchesPrice(r, filterState.price) && (!filterState.rating || r.rating >= parseFloat(filterState.rating));
    }).length;
    var on = filterState.cuisine === c.key ? ' class="on"' : '';
    return '<a' + on + ' onclick="railClick(\'cuisine\',\'' + c.key + '\')">' + escHtml(catLabel(c.key)) + ' <span>' + count + '</span></a>';
  }).join('');

  var districtRail = document.getElementById('rail-districts');
  districtRail.innerHTML = DISTRICTS.map(function (d) {
    var count = allForCounts.filter(function (r) {
      return r.district === d && (!filterState.cuisine || matchesCategory(r, filterState.cuisine)) && matchesPrice(r, filterState.price) && (!filterState.rating || r.rating >= parseFloat(filterState.rating));
    }).length;
    var on = filterState.district === d ? ' class="on"' : '';
    return '<a' + on + ' onclick="railClick(\'district\',\'' + escHtml(d) + '\')">' + escHtml(d) + ' <span>' + count + '</span></a>';
  }).join('');
}

function renderGrid() {
  var lang = currentLang || 'en';
  var t18 = t();
  var filtered = sortList(getFiltered());
  var start = (currentPage - 1) * PAGE_SIZE;
  var pageItems = filtered.slice(start, start + PAGE_SIZE);
  var grid = document.getElementById('results-grid');
  if (!pageItems.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted);font-size:15px;font-weight:500;">' + (t18.card_no_results || 'No restaurants match your search. Try different keywords or filters.') + '</div>';
    return;
  }
  grid.innerHTML = pageItems.map(function (r) {
    var name = (lang === 'zh' && r.name_zh) ? r.name_zh : r.name;
    var cuisine = (lang === 'zh' && r.cuisine_zh) ? r.cuisine_zh : r.cuisine;
    var imgHtml = hasRealPhoto(r)
      ? '<img src="' + escHtml(r.image_url) + '" alt="' + escHtml(name) + '" loading="lazy" referrerpolicy="no-referrer" onload="this.classList.add(\'r-img-loaded\')" onerror="this.classList.add(\'r-img-loaded\')"/>'
      : '<div class="r-card-img-empty">🍽</div>';
    var subline = (lang !== 'zh' && r.name_zh) ? (r.name_zh + ' · ' + r.district) : r.district;
    return '<a class="r-card" href="/restaurant/' + r.slug + '/">' +
      '<div class="r-card-img">' + imgHtml + '<div class="r-card-tag">' + escHtml(cuisine) + '</div><div class="card-verified">✓</div></div>' +
      '<div class="r-card-body">' +
        '<div class="r-card-top"><div class="r-card-name">' + escHtml(name) + '</div><div class="r-rating">⭐ ' + r.rating + '</div></div>' +
        '<div class="r-cuisine">' + escHtml(subline) + '</div>' +
        '<div class="r-meta"><span class="r-district">' + escHtml(r.review_count || '') + '</span><span>' + escHtml(r.price_range) + '</span></div>' +
      '</div></a>';
  }).join('');
}

function renderPagination(total) {
  var pag = document.getElementById('pagination');
  var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (totalPages <= 1) { pag.innerHTML = ''; return; }
  var windowStart = Math.max(1, currentPage - 3);
  var windowEnd = Math.min(totalPages, windowStart + 6);
  windowStart = Math.max(1, windowEnd - 6);
  var html = '<button ' + (currentPage === 1 ? 'disabled' : '') + ' onclick="gotoPage(' + (currentPage - 1) + ')" aria-label="Previous page">←</button>';
  for (var i = windowStart; i <= windowEnd; i++) {
    html += '<button class="' + (i === currentPage ? 'on' : '') + '" onclick="gotoPage(' + i + ')">' + i + '</button>';
  }
  html += '<button ' + (currentPage === totalPages ? 'disabled' : '') + ' onclick="gotoPage(' + (currentPage + 1) + ')" aria-label="Next page">→</button>';
  pag.innerHTML = html;
}

function render() {
  var filtered = getFiltered();
  renderPageHead(filtered);
  renderActiveChips();
  renderSidebar(filtered);
  var t18 = t();
  document.getElementById('results-count-text').textContent = (t18.results_showing_n || 'Showing {n} results').replace('{n}', filtered.length);
  renderGrid();
  renderPagination(filtered.length);
}

window.onLangChange = function () {
  if (!window.allRestaurants) return;
  populateSelects();
  render();
};

document.addEventListener('DOMContentLoaded', function () {
  fetch('/restaurants.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      window.allRestaurants = data;
      populateSelects();
      render();
    })
    .catch(function () {
      var g = document.getElementById('results-grid');
      if (g) g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted);">Could not load restaurants. Please refresh the page.</div>';
    });
});
