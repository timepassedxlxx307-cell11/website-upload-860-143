(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('[data-main-nav] a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function getCardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyFilter(scope, term) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
    var value = (term || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var matched = !value || getCardText(card).indexOf(value) >= 0;
      card.classList.toggle('hidden-by-filter', !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = scope.querySelector('[data-no-results]');
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var clear = scope.querySelector('[data-clear-search]');
      if (input) {
        input.addEventListener('input', function () {
          applyFilter(scope, input.value);
        });
      }
      if (clear && input) {
        clear.addEventListener('click', function () {
          input.value = '';
          applyFilter(scope, '');
          input.focus();
        });
      }
      scope.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-filter') || '';
          if (input) {
            input.value = value;
          }
          applyFilter(scope, value);
        });
      });
    });
  }

  function attachStream(video, streamUrl) {
    if (!video || !streamUrl) {
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        video._hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        video._hlsInstance.attachMedia(video);
      }
      video._hlsInstance.loadSource(streamUrl);
      return new Promise(function (resolve) {
        video._hlsInstance.once(window.Hls.Events.MANIFEST_PARSED, resolve);
      });
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return Promise.resolve();
    }
    video.src = streamUrl;
    return Promise.resolve();
  }

  function initPlayers() {
    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.play-overlay');
      if (!video || !overlay) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream') || '';
      var started = false;

      function play() {
        overlay.classList.add('is-hidden');
        var promise = started ? Promise.resolve() : attachStream(video, streamUrl);
        started = true;
        promise.then(function () {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              overlay.classList.remove('is-hidden');
            });
          }
        });
      }

      overlay.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
