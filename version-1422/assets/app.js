(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobilePanel = document.querySelector(".mobile-panel");

        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                var isOpen = mobilePanel.hasAttribute("hidden");
                if (isOpen) {
                    mobilePanel.removeAttribute("hidden");
                    menuButton.setAttribute("aria-expanded", "true");
                    menuButton.textContent = "×";
                } else {
                    mobilePanel.setAttribute("hidden", "");
                    menuButton.setAttribute("aria-expanded", "false");
                    menuButton.textContent = "☰";
                }
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var currentSlide = 0;
        var slideTimer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            currentSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentSlide);
            });
        }

        function startSlides() {
            if (slides.length < 2) {
                return;
            }
            window.clearInterval(slideTimer);
            slideTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startSlides();
            });
        });

        showSlide(0);
        startSlides();

        var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-scope"));
        var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".js-filter-input"));
        var clearButtons = Array.prototype.slice.call(document.querySelectorAll(".js-clear-filter"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, "");
        }

        function filterCards(value) {
            var query = normalize(value);
            scopes.forEach(function (scope) {
                var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search") || card.textContent);
                    var match = !query || text.indexOf(query) !== -1;
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                var empty = scope.parentElement.querySelector(".empty-result");
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            });
        }

        filterInputs.forEach(function (input) {
            if (initialQuery && input.classList.contains("js-query-input")) {
                input.value = initialQuery;
            }
            input.addEventListener("input", function () {
                filterCards(input.value);
            });
        });

        clearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterInputs.forEach(function (input) {
                    input.value = "";
                });
                filterCards("");
            });
        });

        if (initialQuery) {
            filterCards(initialQuery);
        }

        Array.prototype.slice.call(document.querySelectorAll(".js-player")).forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".js-player-cover");

            if (!video) {
                return;
            }

            var streamUrl = video.getAttribute("src") || "";

            function attachStream() {
                if (!streamUrl) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    player._hls = hls;
                    return;
                }

                video.src = streamUrl;
            }

            function startPlayback() {
                attachStream();
                player.classList.add("is-playing");
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            if (cover) {
                cover.addEventListener("click", startPlayback);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (video.currentTime === 0) {
                    player.classList.remove("is-playing");
                }
            });
        });
    });
}());
