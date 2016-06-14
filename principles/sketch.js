var cubeSize = 160;
var momentum = 0;
var velocity = -48;
var a = 2;
var pos = 500;
var groundPos = -500;
var skyPos = 500;
var mass = 10;
var dir = -1;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(95, 127, 41);
  ambientLight(200);
  pointLight(255, 255, 255, 10, 1, -1);
  ambientMaterial(255);

  velocity += a*dir;
  pos += velocity;
  momentum = mass*velocity;

  if (pos < groundPos) {
    pos = groundPos;
    dir = 1;
  } else if (pos > skyPos) {
    dir = -2;
    console.log(pos);
  }

  // Display Title
  if (frameCount < 120){
    return;
  } else if (frameCount == 120) {
    document.getElementById('title1').style.display = 'none';
  }

  // Translate cube based on position
  translate(0, -pos, -2000);

  // Translate cube to scale based on top
  translate(0, cubeSize, 0);

  // Squash + Stretch
  if (pos == groundPos) {
    if (abs(velocity) >= 90) {
      scale(
        map(abs(velocity), 90, 112, 2, .5),
        map(abs(velocity), 90, 112, .2, 1.5)
      );
    } else {
      scale(
        map(abs(velocity), 0, 90, 1, 2),
        map(abs(velocity), 0, 90, 1, .2)
      );
    }
  } else {
    scale(
      map(abs(velocity), 0, 112, 1, .5),
      map(abs(velocity), 0, 112, 1, 1.5)
    );
  }

  translate(0, -cubeSize, 0);

  rotateY(1);
  box(cubeSize, cubeSize, cubeSize);
}
