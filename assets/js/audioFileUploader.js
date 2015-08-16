function AudioFileUploader(audioContext, player) {
    var self = this,
        audioFile = document.getElementById('audio-input-file'),
        dropContainer = document.getElementById('audio-drop-container'),
        fileName = document.getElementById('play-now');

    self.bindEvents = bindEvents;

    function startPlaying(file) {
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
        e.dataTransfer.dropEffect = 'copy';
        dropContainer.style.opacity = 0.4;
    }

    function onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        var file = e.dataTransfer.files[0];
        startPlaying(file);
    }

    function bindEvents() {
        dropContainer.addEventListener('dragover', onDragover, false);
        dropContainer.addEventListener('drop', onDrop, false);

        audioFile.onchange = function () {
            startPlaying(this.files[0]);
        };
    }
}
