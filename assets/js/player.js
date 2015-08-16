function Player(audioContext, equalizer, visualizer) {
    var self = this,
        controlsWrapper = document.getElementsByClassName('controls')[0],
        playButton = document.getElementById('play-button'),
        pauseButton = document.getElementById('pause-button'),
        stopButton = document.getElementById('stop-button'),
        source,
        buffer,
        startedAt,
        pausedAt;

    self.playBuffer = playBuffer;
    self.bind = bind;

    function playBuffer(b) {
        buffer = b;

        playButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        controlsWrapper.style.display = 'block';

        startedAt = pausedAt = null;
        if (source) { source.stop(0); }
        play();
    }

    function play() {
        source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.onended = stop;

        if (!source.start) {
            source.start = source.noteOn;
            source.stop = source.noteOff;
        }

        if (pausedAt) {
            startedAt = Date.now() - pausedAt;
            source.start(0, pausedAt / 1000);
        }
        else {
            startedAt = Date.now();
            source.start(0);
        }

        equalizer.equalize(source);
        visualizer.visualize(source);
    }

    function stop() {
        source.stop(0);
        visualizer.stop();
        pausedAt = 0;
        playButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    }

    function bind() {
        playButton.addEventListener('click', function () {
            play();
            pauseButton.style.display = 'inline-block';
            playButton.style.display = 'none';

        });

        pauseButton.addEventListener('click', function () {
            source.stop(0);
            visualizer.stop();
            pausedAt = Date.now() - startedAt;
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        });

        stopButton.addEventListener('click', stop);
    }
}
