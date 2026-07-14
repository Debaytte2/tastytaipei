document.addEventListener('DOMContentLoaded', function() {
  cart = JSON.parse(localStorage.getItem('tt_cart') || '[]');
  updateCartUI();
  setLang(currentLang);
  fetch('/restaurants.json')
    .then(function(r){ return r.json(); })
    .then(function(data){
      window.allRestaurants = data;
      renderRestaurantGrid(data);
      updateDistrictCounts(data);
      updateVerifiedBadge(data.length);
      renderSpotlight(data);
      var seeAll = document.getElementById('toppicks-seeall');
      if (seeAll) {
        var t = i18n[currentLang] || {};
        seeAll.querySelector('span').textContent = (t.view_all_n || 'View all {n} →').replace('{n}', data.length);
      }
    })
    .catch(function(){
      var g = document.getElementById('restaurants-grid');
      if (g) g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted);">Could not load restaurants. Please refresh the page.</div>';
    });
});
