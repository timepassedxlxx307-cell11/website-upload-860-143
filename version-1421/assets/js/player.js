(function () {
  function initMoviePlayer(video, playButton, coverLayer, streamUrl) {
    if (!video || !streamUrl) {
      return;
    }

    var loaded = false;
    var hls = null;
    var pendingPlay = false;

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            video.play().catch(function () {});
          }
        });
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      pendingPlay = true;
      loadStream();
      if (coverLayer) {
        coverLayer.classList.add("is-hidden");
      }
      video.play().catch(function () {});
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    if (coverLayer) {
      coverLayer.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", togglePlayback);
    video.addEventListener("play", function () {
      if (coverLayer) {
        coverLayer.classList.add("is-hidden");
      }
    });
    video.addEventListener("error", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      loaded = false;
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
