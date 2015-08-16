(function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;

    var audioContext = new AudioContext();
    var visualizer = new Visualizer(audioContext);
    var equalizer = new Equalizer(audioContext);
    var player = new Player(audioContext, equalizer, visualizer);
    var metadataLoader = new MetadataLoader();
    var uploader = new AudioFileUploader(audioContext, player, metadataLoader);

    equalizer.bindEvents();
    player.bindEvents();
    uploader.bindEvents();
})();

