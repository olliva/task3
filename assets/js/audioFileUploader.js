function AudioFileUploader(audioContext, player, metadataLoader) {
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
        fileReader.onerror = function (e) { throw new Error(e); };
        fileReader.readAsArrayBuffer(file);
    }

    function onFileReaderLoad(e, file) {
        var fileResult = e.target.result;

        audioContext.decodeAudioData(fileResult,
            function (buffer) {
                fileName.textContent = 'Сейчас исполняется файл: ' + url;
                metadataLoader.loadMetadata(file);
                player.playBuffer(buffer);
            },
            function (e) {
                alert('Неподходящий формат файла');
            });
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
