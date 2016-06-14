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
    //console.log(velocity);
    //console.log(momentum);
    pos = groundPos;
    dir = 1;
    //scale(100/velocity, )
    /*scale(
      map(abs(velocity), 0, 64, 1.5, .69),
      map(abs(velocity), 0, 64, .5, 1.31)
    );*/
  } else if (pos > skyPos) {
    //pos = skyPos;
    dir = -2;
    console.log(pos);
  } else {
    console.log(map(abs(velocity), 0, 100, 1, .5), map(abs(velocity), 0, 100, 1, 1.5))  ;
    /*scale(
      map(abs(velocity), 0, 100, 1, .5),
      map(abs(velocity), 0, 100, 1, 1.5)
    );*/
    //scale(1, 1);
  }


  //translate(cubeSize/2, cubeSize/2, cubeSize/2);

  // Adjust camera for debugging
  //translate(0, -550, 0);

  // Make floor for debugging
  /*push();
  translate(0,  500, -1000);
  translate(0, cubeSize, 0);
  box(1000, 10, 1000);
  pop();*/
  /*scale(
    map(abs(velocity), 0, 100, 1, .5),
    map(abs(velocity), 0, 100, 1, 1.5)
  );*/
  //translate(cubeSize/2, cubeSize/2, cubeSize/2);
  translate(0, -pos, -2000);
  //translate(0, -cubeSize, 0);
  translate(0, cubeSize, 0);



  //translate(0, -pos, -1000);
  //rotateZ(frameCount * 0.01);
  //rotateX(frameCount * 0.01);

  if (pos == groundPos) {
    if (abs(velocity) >= 56) {
      scale(
        map(abs(velocity), 56, 112, 1.5, .5),
        map(abs(velocity), 56, 112, .5, 1.5)
      );
    } else {
      scale(
        //map(abs(velocity), 0, 32, 1, 1.5),
        //map(abs(velocity), 0, 32, 1, .5)
        map(abs(velocity), 0, 56, 1, 1.5),
        map(abs(velocity), 0, 56, 1, .5)
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
