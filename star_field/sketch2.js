function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

var boxes = [];
var startZ = [-100000, 0];
//var deltaZ = 100;
var velocity = 0;
var maxZ = 100000;
var minZ = -200000;
var cubeSize = 320;

function draw() {
  background(0);

  if (keyIsDown(UP_ARROW)) {
    velocity += 50;
  } else if (keyIsDown(DOWN_ARROW)) {
    velocity -= 50;
  } else if (velocity != 0){
    velocity += -velocity/abs(velocity)*25;
  }

  if (frameCount % 3 == 0 && velocity != 0) {
    var z = velocity > 0 ? startZ[0] : startZ[1];

    boxes.push([random(-windowWidth*16, windowWidth*16), random(-windowHeight*16, windowHeight*16), z]);
  }

  //translate(0,0,0);
  //push();



  for (var i = 0; i < boxes.length; i++) {
    boxes[i][2] += velocity;

    if (boxes[i][2] < minZ || boxes[i][2] > maxZ) {
      boxes.splice(i, 1);
      i -= 1;
      continue;
    }

    push();

    translate(boxes[i][0], boxes[i][1], boxes[i][2]);
    rotateZ(frameCount * 0.01);
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.01);
    box(cubeSize, cubeSize, cubeSize);
    pop();
  }


}
