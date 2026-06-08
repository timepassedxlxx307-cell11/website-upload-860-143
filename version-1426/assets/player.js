function initMoviePlayer(videoId, sourceUrl, triggerId) {
  var video = document.getElementById(videoId);
  var trigger = document.getElementById(triggerId);
  var hlsInstance = null;
  var prepared = false;

  if (!video) {
    return;
  }

  function attachSource() {
    if (prepared) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 40,
        enableWorker: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else {
      video.src = sourceUrl;
    }

    prepared = true;
  }

  function playVideo() {
    attachSource();
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
