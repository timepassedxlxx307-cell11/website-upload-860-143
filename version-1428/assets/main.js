(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    var startHero = function () {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot'));
        showSlide(index);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var filterGrid = document.querySelector('.filterable-grid');

  if (filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-filter-input]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var count = document.querySelector('[data-filter-count]');

    var unique = function (items) {
      return items.filter(function (item, index) {
        return item && items.indexOf(item) === index;
      });
    };

    var types = unique(cards.map(function (card) {
      return card.getAttribute('data-type');
    })).sort();

    var years = unique(cards.map(function (card) {
      return card.getAttribute('data-year');
    })).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    if (typeSelect) {
      types.forEach(function (type) {
        var option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
      });
    }

    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }

    var updateFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedType = typeSelect ? typeSelect.value : '';
      var selectedYear = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var search = card.getAttribute('data-search') || '';
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var matched = true;

        if (keyword && search.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedType && type !== selectedType) {
          matched = false;
        }

        if (selectedYear && year !== selectedYear) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    };

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', updateFilter);
        control.addEventListener('change', updateFilter);
      }
    });

    updateFilter();
  }

  var searchResults = document.querySelector('[data-search-results]');

  if (searchResults && window.SEARCH_MOVIES) {
    var searchInput = document.querySelector('[data-search-input]');
    var searchStatus = document.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (searchInput) {
      searchInput.value = initialKeyword;
    }

    var renderCard = function (movie) {
      return [
        '<a class="movie-card" href="' + movie.url + '">',
        '  <div class="card-poster">',
        '    <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
        '    <span class="card-badge">' + movie.region + '</span>',
        '    <span class="play-dot">▶</span>',
        '  </div>',
        '  <div class="card-body">',
        '    <h3>' + movie.title + '</h3>',
        '    <p class="card-line">' + movie.oneLine + '</p>',
        '    <div class="card-meta"><span>' + movie.type + '</span><span>' + movie.year + '</span></div>',
        '  </div>',
        '</a>'
      ].join('');
    };

    var doSearch = function () {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      searchResults.innerHTML = '';

      if (!keyword) {
        if (searchStatus) {
          searchStatus.textContent = '请输入关键词开始搜索。';
        }
        return;
      }

      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 200);

      searchResults.innerHTML = matched.map(renderCard).join('');

      if (searchStatus) {
        searchStatus.textContent = '找到 ' + matched.length + ' 条相关结果。';
      }
    };

    var form = document.querySelector('[data-search-form]');

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var keyword = searchInput ? searchInput.value.trim() : '';
        var nextUrl = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        doSearch();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', doSearch);
    }

    doSearch();
  }
})();
