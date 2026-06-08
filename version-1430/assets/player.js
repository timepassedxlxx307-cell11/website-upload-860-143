(function() {
  window.initMoviePlayer = function(source) {
    var video = document.querySelector('[data-player-video]');
    var launch = document.querySelector('[data-player-launch]');
    var loaded = false;
    var hlsInstance = null;

    if (!video || !launch || !source) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function playVideo() {
      loadVideo();
      launch.classList.add('player-overlay-hidden');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {});
      }
    }

    launch.addEventListener('click', playVideo);
    video.addEventListener('click', function() {
      if (!loaded || video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
