var cubeSize = 160;
/*var momentum = 0;
var velocity = -48;
var a = 2;
var pos = 500;
var groundPos = -500;
var skyPos = 500;
var mass = 10;
var dir = -1;*/

var pos = 0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
  background(95, 127, 41);
  ambientLight(200);
  directionalLight(255, 255, 255, 0, 1, 0);
  ambientMaterial(255);



  // Display Title
  /*if (frameCount < 120){
    return;
  } else if (frameCount == 120) {
    document.getElementById('title1').style.display = 'none';
  }*/

  // Translate cube based on position
  translate(pos, 500, -1000);

  //rotateY(1);
  if (frameCount < 150) {
    rotateZ(.5*Math.sin(frameCount * .05));
  } else if (frameCount > 150) {
    pos -= 10;
    rotateZ(Math.sin(frameCount * .05));
  }

  box(cubeSize, cubeSize, cubeSize);
}
