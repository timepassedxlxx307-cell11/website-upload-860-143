(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function update() {
            if (window.scrollY > 420) {
                button.classList.add("is-visible");
            } else {
                button.classList.remove("is-visible");
            }
        }
        window.addEventListener("scroll", update, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        update();
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
        inputs.forEach(function (input) {
            var scope = input.closest(".page-search-scope") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    card.style.display = haystack.indexOf(keyword) !== -1 ? "" : "none";
                });
            });
        });
    }

    function initFilterChips() {
        var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chips]"));
        groups.forEach(function (group) {
            var scope = group.closest(".page-search-scope") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter-chip]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-chip");
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var haystack = card.getAttribute("data-search") || card.textContent || "";
                        card.style.display = value === "全部" || haystack.indexOf(value) !== -1 ? "" : "none";
                    });
                });
            });
        });
    }

    ready(function () {
        initMenu();
        initBackTop();
        initHero();
        initSearch();
        initFilterChips();
    });
})();

function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("moviePlayer");
    var cover = document.getElementById("playerCover");
    var loaded = false;
    var hls = null;

    if (!video || !sourceUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        load();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
