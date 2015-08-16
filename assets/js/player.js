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
    self.bindEvents = bindEvents;

    function playBuffer(b) {
        if (source) {
            stop();
        }
        
        buffer = b;

        playButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        controlsWrapper.style.display = 'block';

        startedAt = pausedAt = null;
        play();
    }

    function play() {
        source = audioContext.createBufferSource();
        if (!source.start) {
            source.start = source.noteOn;
            source.stop = source.noteOff;
        }

        source.buffer = buffer;
        source.onended = onEnd;

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
        pausedAt = 0;
    }

    function onEnd(e) {
        if (e.target != source) {
            return;
        }

        visualizer.stop();
        playButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    }

    function bindEvents() {
        playButton.addEventListener('click', function () {
            play();
            pauseButton.style.display = 'inline-block';
            playButton.style.display = 'none';
        });

        pauseButton.addEventListener('click', function () {
            source.stop(0);
            pausedAt = Date.now() - startedAt;
        });

        stopButton.addEventListener('click', stop);
    }
}
