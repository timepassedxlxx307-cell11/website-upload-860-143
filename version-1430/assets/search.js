(function() {
  var movies = window.SITE_MOVIES || [];
  var form = document.querySelector('[data-search-page-form]');
  var input = document.querySelector('[data-search-page-input]');
  var regionSelect = document.querySelector('[data-search-region]');
  var typeSelect = document.querySelector('[data-search-type]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var params = new URLSearchParams(window.location.search);

  function uniqueValues(key) {
    return movies.map(function(movie) {
      return movie[key];
    }).filter(Boolean).filter(function(value, index, array) {
      return array.indexOf(value) === index;
    }).sort();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function(match) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[match];
    });
  }

  function option(value) {
    var item = document.createElement('option');
    item.value = value;
    item.textContent = value;
    return item;
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function(value) {
      select.appendChild(option(value));
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).join(' ');
    return '<article class="movie-card movie-card-compact" data-movie-card>' +
      '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="cover-shade"></span>' +
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<h2 class="movie-card-title"><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>' +
      '<p class="movie-card-text">' + escapeHtml(movie.oneLine || '') + '</p>' +
      '<div class="movie-card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
      '<div class="movie-card-tags">' + escapeHtml(tags) + '</div>' +
      '</div>' +
      '</article>';
  }

  function render() {
    if (!results) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : 'all';
    var type = typeSelect ? typeSelect.value : 'all';
    var matched = movies.filter(function(movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      var regionMatched = region === 'all' || movie.region === region;
      var typeMatched = type === 'all' || movie.type === type;
      return keywordMatched && regionMatched && typeMatched;
    });
    if (count) {
      count.textContent = matched.length ? '已匹配 ' + matched.length + ' 部' : '暂无匹配';
    }
    results.innerHTML = matched.slice(0, 160).map(movieCard).join('');
  }

  fillSelect(regionSelect, uniqueValues('region'));
  fillSelect(typeSelect, uniqueValues('type'));

  if (input) {
    input.value = params.get('q') || '';
    input.addEventListener('input', render);
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', render);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', render);
  }

  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      render();
    });
  }

  render();
})();
