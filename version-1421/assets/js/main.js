(function () {
  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!form || !cards.length) {
      return;
    }
    function applyFilter() {
      var formData = new FormData(form);
      var keyword = normalize(formData.get("keyword"));
      var region = normalize(formData.get("region"));
      var type = normalize(formData.get("type"));
      var year = normalize(formData.get("year"));
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || normalize(card.dataset.region) === region;
        var matchType = !type || normalize(card.dataset.type) === type;
        var matchYear = !year || normalize(card.dataset.year) === year;
        card.classList.toggle("is-hidden", !(matchKeyword && matchRegion && matchType && matchYear));
      });
    }
    form.addEventListener("input", applyFilter);
    form.addEventListener("change", applyFilter);
  }

  function createResultCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="poster-shade"></span>',
      '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var form = document.querySelector("[data-search-page-form]");
    if (!results || !status || !form || !window.SiteMovies) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var query = normalize(input.value);
      if (!query) {
        status.textContent = "请输入关键词开始搜索";
        results.innerHTML = "";
        return;
      }
      var matched = window.SiteMovies.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        return text.indexOf(query) !== -1;
      }).slice(0, 120);
      status.textContent = matched.length ? "找到 " + matched.length + " 部相关影片" : "未找到相关影片";
      results.innerHTML = matched.map(createResultCard).join("");
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", nextUrl);
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  setupNavigation();
  setupHero();
  setupFilters();
  setupSearchPage();
}());
