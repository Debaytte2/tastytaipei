document.addEventListener('DOMContentLoaded', function() {
  cart = JSON.parse(localStorage.getItem('tt_cart') || '[]');
  updateCartUI();
  fetch('/restaurants.json')
    .then(function(r){ return r.json(); })
    .then(function(data){
      window.allRestaurants = data;
      renderRestaurantGrid(data);
      updateDistrictCounts(data);
    })
    .catch(function(){
      var g = document.getElementById('restaurants-grid');
      if (g) g.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--muted);">Could not load restaurants. Please refresh the page.</div>';
    });
});
