(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });

    document.querySelectorAll("[data-local-search]").forEach(function (input) {
      var scopeSelector = input.getAttribute("data-scope") || "[data-filterable]";
      var scope = document.querySelector(scopeSelector);
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      input.addEventListener("input", function () {
        var query = text(input.value);
        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        showSlide(itemIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");

    function renderResults(query) {
      if (!results || !window.MOVIE_SEARCH_DATA) {
        return;
      }
      var normalized = text(query);
      var data = window.MOVIE_SEARCH_DATA;
      var matched = normalized
        ? data.filter(function (movie) {
            return text([
              movie.title,
              movie.region,
              movie.type,
              movie.genre,
              movie.tags,
              movie.year
            ].join(" ")).indexOf(normalized) !== -1;
          })
        : data.slice(0, 30);

      results.innerHTML = "";

      if (status) {
        status.textContent = normalized ? "已为你整理相关影片" : "精选热播内容";
      }

      if (!matched.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配内容，试试其他片名、类型或地区。</div>';
        return;
      }

      var grid = document.createElement("div");
      grid.className = "movie-grid";
      matched.slice(0, 120).forEach(function (movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.setAttribute("data-movie-card", "");
        article.innerHTML = [
          '<a class="card-cover" href="' + movie.file + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="card-badge">' + escapeHtml(movie.year) + '</span>',
          '</a>',
          '<div class="card-body">',
          '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
          '<h3><a href="' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
          '<p>' + escapeHtml(movie.intro) + '</p>',
          '<div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
          '</div>'
        ].join("");
        grid.appendChild(article);
      });
      results.appendChild(grid);
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    if (searchInput && results) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;
      renderResults(initial);
      searchInput.addEventListener("input", function () {
        renderResults(searchInput.value);
      });
    }
  });
})();
