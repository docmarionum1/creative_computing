var boxSize;

/*var momentum = 0;
var velocity = -48;
var a = 2;
var pos = 500;
var groundPos = -500;
var skyPos = 500;
var mass = 10;
var dir = -1;
*/

var a = 2;
var velocity = 0;
var pos;// = 2000;
var dir = -1;
var count = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  boxSize = [windowWidth/25, windowHeight/4];
  pos = windowWidth*.75;
}

function draw() {
  background(46, 71, 74);
  fill(255);
  noStroke();
  /*ambientLight(200);
  directionalLight(255, 255, 255, 0, 0, 1);
  ambientMaterial(255);*/

  velocity += a * dir;
  pos += velocity;

  if (pos <= windowWidth*.5) {
    dir = 1;
  }
  if (pos <= windowWidth*.3) {
    dir = 0;
    velocity = 0;
  }
  /*// Display Title
  if (frameCount < 120){
    return;
  } else if (frameCount == 120) {
    document.getElementById('title5').style.display = 'none';
  }*/

  // Translate cube based on position
  //translate(0, -pos, -2000);

  // Translate cube to scale based on top
  //translate(0, cubeSize, 0);

  console.log(velocity);

  //translate(pos, 0, -1000);
  //translate(0, -boxSize[1]);

  translate(0, height/2);
  translate(pos, boxSize[1]);

  if (dir != 0) {
    shearX(map(abs(velocity), 0, 36, 0, -.7));
  } else {
    // -.333333333333
    if (count < 8) {
      shearX(map(Math.cos(count), -1, 1, .3888888888, -.3888888888));
  } else if (count < 23.5) {
      shearX(map(Math.cos(count), -1, 1, 8*.3888888888/count, 8*-.3888888888/count));
    }
    count += .2;
  }

  //translate(pos, 0);

  translate(0, -boxSize[1]);

  //rotateY(.1);
  //box(boxSize[0], boxSize[1], boxSize[2]);
  rect(0, 0, boxSize[0], boxSize[1]);//, boxSize[2]);




}
