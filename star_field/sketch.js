var canvasWidth = null;
var canvasHeight = 150;
var w = 80;
var h = 80;
var speed = 10;
var dir = 0;
var i = w;
var velocity = 0;
var blue, red;
var distance = 0;

function setup() {
  canvasWidth = windowWidth;
  createCanvas(canvasWidth, canvasHeight);
  blue = color(0,0,255);
  red = color(255,0,0);
}


function draw() {
  background(0, 0, 0);

  if (keyIsDown(LEFT_ARROW)) {
    velocity -= 2;
  } else if (keyIsDown(RIGHT_ARROW)) {
    velocity += 2;
  } else if (velocity != 0){
    velocity += -velocity/abs(velocity);
  }


  // Update i
  i = i + velocity;

  fill(lerpColor(blue, red, map(velocity, -500, 500, 0, 1)));

  // True circle
  ellipse(i - w/2, 50, w, h);

  // Trailing Circle
  ellipse(i - canvasWidth - w/2, 50, w, h);

  //Leading Circle
  ellipse(i + canvasWidth - w/2, 50, w, h);

  // If we go off the right edge, move back to left
  if (i > (canvasWidth + w)) {
    i = w;
  }

  // If we go off the left edge, move bcak to right
  if (i < 0) {
    i = canvasWidth;
  }

  // Display Total Distance
  distance += abs(velocity);
  textSize(32);
  text("Distance Traveled: " + distance, 10, 130);

}
