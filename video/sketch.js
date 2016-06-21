var videoWidth = 160;
var videoHeight = 120;
var canvas;
var average;
var foreground;
//background

function setup() {
    canvas = createCanvas(videoWidth,videoHeight);
    capture = createCapture(VIDEO);
    average = createImage(videoWidth, videoHeight);
    foreground = createImage(videoWidth, videoHeight);
    capture.size(videoWidth, videoHeight);
    background(255);
    noStroke();
}


function draw() {
    capture.loadPixels();
    average.loadPixels();
    foreground.loadPixels();

    for (var i = 0; i < capture.pixels.length; i+=4) {
      for (var j = i; j < i+3; j++) {
        //foreground.pixels[j] = abs(capture.pixels[j] - average.pixels[j]) < 50 ? 255 : capture.pixels[j];
        foreground.pixels[j] = capture.pixels[j];
        average.pixels[j] = capture.pixels[j];//average.pixels[j]*.9 + capture.pixels[j]*.1;
      }
      var gray = 0.3 * foreground.pixels[i] + 0.6 * foreground.pixels[i+1] + 0.11 * foreground.pixels[i+2];//0.3R+0.6G+0.11B
      foreground.pixels[i] = gray;
      foreground.pixels[i+1] = gray;
      foreground.pixels[i+2] = gray;

      foreground.pixels[i+3] = 255;
    }
    average.updatePixels();
    foreground.updatePixels();
    image(foreground, 0, 0, videoWidth, videoHeight);
    //filter(GRAY);

}
