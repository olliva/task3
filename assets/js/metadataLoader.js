function MetadataLoader() {
    var self = this,
        metadataWrapper = document.getElementsByClassName('main-inform')[0],
        artistField = document.getElementById("artist"),
        titleField = document.getElementById("title"),
        albumField = document.getElementById("album");

    self.loadMetadata = loadMetadata;

    function loadMetadata(file) {
        var url = file.url || file.name;
        var reader = FileAPIReader(file);

        ID3.loadTags(url,
            function () {
                var tags = ID3.getAllTags(url);
                artistField.textContent = tags.artist || "";
                titleField.textContent = tags.title || "";
                albumField.textContent = tags.album || "";
                metadataWrapper.style.display = 'block';
            },
            {
                tags: ["artist", "title", "album"],
                dataReader: reader
            });
    }
}