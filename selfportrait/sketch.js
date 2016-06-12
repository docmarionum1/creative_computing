var videoWidth = 400;
var videoHeight = 300;
var canvas;
var state = 'webcam';
var target;
var currentDiff;
var currentCanvas;

function setup() {
    canvas = createCanvas(videoWidth,videoHeight);
    capture = createCapture(VIDEO);
    capture.size(videoWidth, videoHeight);
    background(255);
    noStroke();
}

function keyPressed() {
    if (state === 'webcam' && keyCode === ENTER) {
        state = 'render';
        target = canvas.drawingContext.getImageData(0, 0, videoWidth, videoHeight);
        background(255);
        currentCanvas = canvas.drawingContext.getImageData(0, 0, videoWidth, videoHeight);
        currentDiff = diff(target, currentCanvas);
    }
}

function diff(a, b) {
    var sum = 0;
    for (var i = 0; i < a.data.length; i++) {
        sum += Math.abs(a.data[i] - b.data[i]);
    }
    return sum;
}

function randomInt(max) {
    return Math.floor(Math.random() * max + 1);
}

function modifyCanvas() {
    fill(
        randomInt(255),
        randomInt(255),
        randomInt(255),
        randomInt(255)
    );
    rect(
        randomInt(videoWidth),
        randomInt(videoHeight),
        randomInt(videoWidth),
        randomInt(videoHeight)
    );

    var newCanvas = canvas.drawingContext.getImageData(0, 0, videoWidth, videoHeight);
    var newDiff = diff(target, newCanvas);
    console.log(newDiff);

    if (newDiff < currentDiff) {
        currentCanvas = newCanvas;
        currentDiff = newDiff;
    } else {
        canvas.drawingContext.putImageData(currentCanvas, 0, 0);
    }
}

function draw() {
    if (state == 'webcam') {
        image(capture, 0, 0, videoWidth, videoHeight);
    } else if (state === 'render') {
        modifyCanvas();
    }
}
