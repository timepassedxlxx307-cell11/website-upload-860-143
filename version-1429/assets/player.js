(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.getElementById("movie-video");
        if (!video) {
            return;
        }
        var source = video.querySelector("source");
        var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
        var overlay = document.querySelector(".player-overlay");
        var sourceUrl = source ? source.getAttribute("src") : "";
        var loaded = false;
        var hls = null;

        function loadVideo() {
            if (loaded || !sourceUrl) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function startPlayback() {
            loadVideo();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("hidden");
                    }
                });
            }
        }

        playButtons.forEach(function (button) {
            button.addEventListener("click", startPlayback);
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    });
})();
