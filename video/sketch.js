var videoWidth = 320;
var videoHeight = 240;
var canvas;
var previous;
var capture;
var moving;
var glass;
var count = 0;
//background

function setup() {
    canvas = createCanvas(videoWidth,videoHeight);
    capture = createCapture(VIDEO);
    capture.size(videoWidth, videoHeight);

    previous = createImage(videoWidth, videoHeight);
    moving = createImage(videoWidth, videoHeight);
    glass = createImage(videoWidth, videoHeight);

    background(255);
    noStroke();

    previous.loadPixels();
    moving.loadPixels();
    glass.loadPixels();

    for (var i = 0; i < previous.pixels.length; i+=4) {
        moving.pixels[i+3] = 255;
        previous.pixels[i+3] = 255;

        drawDirt(i);
    }

    moving.updatePixels();
    previous.updatePixels();
    glass.updatePixels();
}

function drawDirt(i) {
    glass.pixels[i] = random(255);
    glass.pixels[i+1] = random(255);
    glass.pixels[i+2] = random(255);
    glass.pixels[i+3] = 255;
}


function draw() {
    capture.loadPixels();
    previous.loadPixels();
    moving.loadPixels();
    glass.loadPixels();

    for (var i = 0; i < capture.pixels.length; i+=4) {
      var gray = 0.3 * capture.pixels[i] + 0.6 * capture.pixels[i+1] + 0.11 * capture.pixels[i+2];//0.3R+0.6G+0.11B

      for (var j = i; j < i+3; j++) {
          if (abs(gray - previous.pixels[j]) < 10) {
              moving.pixels[j] = 255;
          } else {
              moving.pixels[j] = capture.pixels[j];
              if (count > 30)
                glass.pixels[i+3] = 0;
          }
          previous.pixels[j] = gray;
      }

      if (random(100) < .1) {
          drawDirt(i);
      }

      /*if (glass.pixels[i+3] == 255) {
          glass.pixels[i] = capture.pixels[i];
          glass.pixels[i+1] = capture.pixels[i+1];
          glass.pixels[i+2] = capture.pixels[i+2];
      }*/

    }

    if (capture.pixels.length > 0) {
        count++;
    }

    previous.updatePixels();
    moving.updatePixels();
    glass.updatePixels();
    image(capture, 0, 0, videoWidth, videoHeight);
    image(glass, 0, 0, videoWidth, videoHeight);
    //filter(GRAY);

}
