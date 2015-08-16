function Visualizer(audioContext) {
    var self = this,
        canvas = document.getElementById('visualizer'),
        canvasWidth = canvas.width,
        canvasHeight = canvas.height - 2,
        meterWidth = 5, //width of the meters in the spectrum
        gap = 1, //gap between meters
        capHeight = 2,
        capStyle = '#121A5E',
        meterNum = canvasWidth / (meterWidth + gap), //count of the meters
        array = [],
        capYPositionArray = [], ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0, 0, 0, 200),
        analyser,
        animationId,
        allCapsReachBottom = false,
        isAnimating = false,
        isPlaying = false;

    gradient.addColorStop(1, '#EBFC05');
    gradient.addColorStop(0.6, '#23BAB5');
    gradient.addColorStop(0, '#121A5E');

    self.visualize = visualize;
    self.stop = stop;

    function visualize(source) {
        isPlaying = true;
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        //connect the analyser to the destination(the speaker), or we won't hear the sound
        analyser.connect(audioContext.destination);
        requestAnimation();
    }

    function stop() {
        isPlaying = false;
        //fix when some sounds end the value still not back to zero
        for (var i = array.length - 1; i >= 0; i--) {
            array[i] = 0;
        }
        allCapsReachBottom = true;
        for (var i = capYPositionArray.length - 1; i >= 0; i--) {
            allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
        }
        if (allCapsReachBottom) {
            cancelAnimation(); //since the sound is top and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
            return;
        }
    }

    function requestAnimation() {
        if (isAnimating) {
            return;
        }

        animationId = requestAnimationFrame(drawMeter);
        isAnimating = true;
    }

    function cancelAnimation() {
        cancelAnimationFrame(animationId);
        isAnimating = false;
    }

    function drawMeter() {
        array = new Uint8Array(analyser.frequencyBinCount);
        
        if (isPlaying) {
            analyser.getByteFrequencyData(array);    
        }

        var step = Math.round(array.length / meterNum); //sample limited data from the total array
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step] * 0.75;
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            }
            ctx.fillStyle = capStyle;
            //draw the cap, with transition effect
            if (value < capYPositionArray[i]) {
                ctx.fillRect(i * (meterWidth + gap) /** 12*/, canvasHeight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                ctx.fillRect(i * (meterWidth + gap) /** 12*/, canvasHeight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            }
            ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
            ctx.fillRect(i * (meterWidth + gap) /** 12*/ /*meterWidth+gap*/, canvasHeight - value + capHeight, meterWidth, canvasHeight); //the meter
        }
        requestAnimationFrame(drawMeter);
    }
}

function Equalizer(audioContext) {
    var self = this,
        genreSelect = document.getElementById('genre'),
        dropdownMenu = document.getElementById('dropdown-menu'),
        dropdownList = document.getElementById('dropdown-list'),
        filters = [];

    // http://askubuntu.com/questions/326976/how-to-import-winamp-equalizer-presets-to-audacious
    var presets = {
        normal: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        pop: [-1, 4, 7, 8, 5, -1, -2, -2, -1, -1],
        rock: [8, 4, -5, -8. - 3, 4, 8, 11, 11, 11],
        jazz: [4, 3, 1, 2, -1, -1, 0, 1, 3, 5],
        classic: [-1, -1, -1, -1, -1, -1, -7, -7, -7, -9]
    };

    self.equalize = equalize;

    function equalize(source) {
        // источник цепляем к первому фильтру
        source.connect(filters[0]);
        // а последний фильтр - к выходу
        filters[filters.length - 1].connect(audioContext.destination);
    }

    function createFilter(frequency) {
        var filter = audioContext.createBiquadFilter();

        filter.type = 'peaking'; // тип фильтра
        filter.frequency.value = frequency; // частота
        filter.Q.value = 1; // Q-factor
        filter.gain.value = 0;

        return filter;
    }

    function createFilters() {
        var frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        var filters = frequencies.map(createFilter);

        filters.reduce(function (prev, curr) {
            prev.connect(curr);
            return curr;
        });

        return filters;
    }

    function init() {
        filters = createFilters();
    }

   /* genreSelect.addEventListener('change', function (e) {
        var genre = e.target.value;
        var preset = presets[genre];
        for (var i = 0; i < preset.length; i++) {
            filters[i].gain.value = preset[i];
        }
    });*/
    dropdownMenu.addEventListener('click', function(e){
        dropdownList.style.display = (dropdownList.style.display == 'none') ? 'block' : 'none'

    });
    dropdownList.addEventListener('click', function(e){
        dropdownList.style.display = 'none';
        var genre = e.target.textContent;
        if (genre != dropdownMenu.textContent){
            dropdownMenu.innerHTML = genre + '<span class="caret"></span>';
            var preset = presets[genre.toLowerCase()];
            for (var i = 0; i < preset.length; i++) {
                filters[i].gain.value = preset[i];
            }
        }
        e.preventDefault();
    });

    init();
}

function Player(audioContext, equalizer, visualizer) {
    var self = this,
        playButton = document.getElementById('play-button'),
        pauseButton = document.getElementById('pause-button'),
        stopButton = document.getElementById('stop-button'),
        source,
        buffer,
        startedAt,
        pausedAt;

    self.playBuffer = playBuffer;

    function playBuffer(b) {
        buffer = b;
        startedAt = pausedAt = null;
        if (source) { source.stop(0); }
        play();
    }

    function play() {
        source = audioContext.createBufferSource();
        source.buffer = buffer;

        source.onended = stop;

        if (!source.start) {
            source.start = source.noteOn; //in old browsers use noteOn method
            source.stop = source.noteOff;  //in old browsers use noteOn method
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

    bind();
}


function AudioFileUploader(audioContext, player) {
    var audioFile = document.getElementById('audio-input-file'),
        dropContainer = document.getElementById('audio-drop-container'),
        fileName = document.getElementById('play-now');

    function start(file) {
        if (!file) {
            return;
        }

        var fileReader = new FileReader();

        fileReader.onload = function (e) { onFileReaderLoad(e, file) };
        fileReader.onerror = function (e) {
            throw new Error(e);
        };

        fileReader.readAsArrayBuffer(file);
    }

    function onFileReaderLoad(e, file) {
        var fileResult = e.target.result;

        audioContext.decodeAudioData(fileResult,
            function (buffer) {
                document.getElementsByClassName('controls')[0].style.display = 'block';
                document.getElementById('play-button').style.display = 'none';
                document.getElementById('pause-button').style.display = 'inline-block';

                var url = file.url || file.name;
                fileName.textContent = 'Сейчас исполняется файл: ' + url;
                loadMetadata(url, FileAPIReader(file));
                player.playBuffer(buffer);
            },
            function (e) {
                alert('Неподходящий формат файла');
            });
    }

    function loadMetadata(url, reader) {
        ID3.loadTags(url,
            function () {
                var tags = ID3.getAllTags(url);
                document.getElementById("artist").textContent = tags.artist || "";
                document.getElementById("title").textContent = tags.title || "";
                document.getElementById("album").textContent = tags.album || "";
            },
            {
                tags: ["artist", "title", "album"],
                dataReader: reader
            });
        document.getElementsByClassName('main-inform')[0].style.display = 'block';
    }

    function onDragover(e) {
        e.stopPropagation();
        e.preventDefault();
        //set the drop mode
        e.dataTransfer.dropEffect = 'copy';
        dropContainer.style.opacity = 0.4;
    }

    function onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        //get the dropped file
        var file = e.dataTransfer.files[0];
        start(file);
    }

    function bind() {
        dropContainer.addEventListener('dragover', onDragover, false);
        dropContainer.addEventListener('drop', onDrop, false);

        audioFile.onchange = function () {
            start(this.files[0]);
        };
    }

    bind();
}

(function () {
    var audioContext = prepareAudioContext();
    var visualizer = new Visualizer(audioContext);
    var equalizer = new Equalizer(audioContext);
    var player = new Player(audioContext, equalizer, visualizer);
    var uploader = new AudioFileUploader(audioContext, player);

    function prepareAudioContext() {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            return new AudioContext();
        } catch (e) {
            throw new Error('!Your browser does not support AudioContext');
        }
    }
})();

