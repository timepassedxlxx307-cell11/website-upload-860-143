(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector("[data-site-header]");
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        var backButton = document.querySelector("[data-back-to-top]");

        function updateHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 16) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        if (backButton) {
            backButton.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }

        setupHero();
        setupFilters();
        hydrateSearchQuery();
    });

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement.querySelector("[data-filter-scope]") || document.querySelector("[data-filter-scope]");
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var searchInput = panel.querySelector("[data-search-input]");
            var typeFilter = panel.querySelector("[data-type-filter]");
            var yearFilter = panel.querySelector("[data-year-filter]");
            var clearButton = panel.querySelector("[data-clear-filter]");
            var empty = panel.parentElement.querySelector("[data-empty-state]");

            function value(element) {
                return element ? element.value.trim().toLowerCase() : "";
            }

            function apply() {
                var term = value(searchInput);
                var type = value(typeFilter);
                var year = value(yearFilter);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matchTerm = !term || text.indexOf(term) !== -1;
                    var matchType = !type || text.indexOf(type) !== -1;
                    var matchYear = !year || card.getAttribute("data-year") === year;
                    var show = matchTerm && matchType && matchYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [searchInput, typeFilter, yearFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });

            if (clearButton) {
                clearButton.addEventListener("click", function () {
                    if (searchInput) {
                        searchInput.value = "";
                    }
                    if (typeFilter) {
                        typeFilter.value = "";
                    }
                    if (yearFilter) {
                        yearFilter.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function hydrateSearchQuery() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }
})();
