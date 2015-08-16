function Visualizer(audioContext) {
    var self = this,
        canvas = document.getElementById('visualizer'),
        canvasWidth = canvas.width,
        canvasHeight = canvas.height - 2,
        meterWidth = 5,
        gap = 1,
        capHeight = 2,
        capStyle = '#121A5E',
        meterNum = canvasWidth / (meterWidth + gap),
        array = [],
        capYPositionArray = [],
        ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0, 0, 0, 200),
        analyser,
        animationId,
        allCapsReachBottom = false,
        isAnimating = false,
        isPlaying = false;

    self.visualize = visualize;
    self.stop = stop;

    function visualize(source) {
        isPlaying = true;
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        requestAnimation();
    }

    function stop() {
        isPlaying = false;
        for (var i = array.length - 1; i >= 0; i--) {
            array[i] = 0;
        }
        allCapsReachBottom = true;
        for (var i = capYPositionArray.length - 1; i >= 0; i--) {
            allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
        }
        if (allCapsReachBottom) {
            cancelAnimation();
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

        var step = Math.round(array.length / meterNum);
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for (var i = 0; i < meterNum; i++) {
            // frequency data is within [0, 256], but canvas height is 200px
            // so we should scale frequency values to fit in canvas
            var scaleCoefficient = 0.75;
            var value = array[i * step] * scaleCoefficient;
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            }
            ctx.fillStyle = capStyle;
            if (value < capYPositionArray[i]) {
                ctx.fillRect(i * (meterWidth + gap), canvasHeight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                ctx.fillRect(i * (meterWidth + gap) , canvasHeight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(i * (meterWidth + gap), canvasHeight - value + capHeight, meterWidth, canvasHeight);
        }
        requestAnimationFrame(drawMeter);
    }

    function init() {
        gradient.addColorStop(1, '#EBFC05');
        gradient.addColorStop(0.6, '#23BAB5');
        gradient.addColorStop(0, '#121A5E');
    }

    init();
}