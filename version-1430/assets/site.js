(function() {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = $('[data-menu-toggle]');
  var mobileNav = $('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
      menuButton.classList.toggle('is-open');
    });
  }

  var carousel = $('[data-hero-carousel]');

  if (carousel) {
    var slides = $all('[data-hero-slide]', carousel);
    var dots = $all('[data-hero-dot]', carousel);
    var prev = $('[data-hero-prev]', carousel);
    var next = $('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var heroForm = $('[data-search-form]');
  var heroInput = $('[data-search-input]');

  if (heroForm && heroInput) {
    heroForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var value = heroInput.value.trim();
      window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  }

  var localFilter = $('[data-card-filter]');

  if (localFilter) {
    var cards = $all('[data-movie-card]');
    localFilter.addEventListener('input', function() {
      var keyword = localFilter.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        card.hidden = keyword && haystack.indexOf(keyword) === -1;
      });
    });
  }

  var sidePlay = $('[data-side-play]');
  var playerLaunch = $('[data-player-launch]');

  if (sidePlay && playerLaunch) {
    sidePlay.addEventListener('click', function(event) {
      event.preventDefault();
      playerLaunch.click();
      var player = $('[data-player-video]');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
})();
