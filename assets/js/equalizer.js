function Equalizer(audioContext) {
    var self = this,
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
    self.bind = bind;

    function equalize(source) {
        source.connect(filters[0]);
        filters[filters.length - 1].connect(audioContext.destination);
    }

    function createFilter(frequency) {
        var filter = audioContext.createBiquadFilter();

        filter.type = 'peaking';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
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

    function bind() {
        dropdownMenu.addEventListener('click', function (e) {
            dropdownList.style.display = (dropdownList.style.display == 'none') ? 'block' : 'none'

        });
        dropdownList.addEventListener('click', function (e) {
            dropdownList.style.display = 'none';
            var genre = e.target.textContent;
            if (genre != dropdownMenu.textContent) {
                dropdownMenu.innerHTML = genre + '<span class="caret"></span>';
                var preset = presets[genre.toLowerCase()];
                for (var i = 0; i < preset.length; i++) {
                    filters[i].gain.value = preset[i];
                }
            }
            e.preventDefault();
        });
    }

    init();
}
