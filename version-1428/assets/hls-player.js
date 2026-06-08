(function () {
  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);

    if (!video || !button || !sourceUrl) {
      return;
    }

    var attached = false;

    var attachSource = function () {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        attached = true;
        return;
      }

      video.src = sourceUrl;
      attached = true;
    };

    var playVideo = function () {
      attachSource();
      button.classList.add('is-hidden');
      video.controls = true;

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    };

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  };
})();
