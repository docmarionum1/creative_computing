// Used by both
var velocity;
var a;
var pos;
var dir;

// Used by #1
var cubeSize = 160;
var groundPos = -500;
var skyPos = 500;

// Used by #5
var count;
var boxSize;

// The current principle being show.  Start at #1.
var state = 1;

/*
    Setup depending on which principle is being shown.
    #1 requires WEBGL and #5 is 2D.
 */
function setup() {
  if (state == 1) {
      createCanvas(windowWidth, windowHeight, WEBGL);
      pos = 500;
      a = 2;
      velocity = -48;
      dir = -1;
  } else {
      createCanvas(windowWidth, windowHeight);
      boxSize = [windowWidth/25, windowHeight/4];
      pos = windowWidth*.75;
      dir = -1;
      velocity = 0;
      a = 2;
      count = 1;
  }
}

/*
    Animation for principle 1.
 */
function principle1() {
    background(95, 127, 41);
    ambientLight(200);
    pointLight(255, 255, 255, 10, 1, -1);
    ambientMaterial(255);

    // Update velocity and position.
    velocity += a*dir;
    pos += velocity;

    // If the cube hits the ground make sure it stops
    // If it reaches the top of its arc, slow it down.
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

/*
    Animation for principle 5
 */
function principle5() {
    background(46, 71, 74);
    fill(255);
    noStroke();

    // Display title
    if (frameCount < 120){
      return;
    } else if (frameCount == 120) {
      document.getElementById('title5').style.display = 'none';
    }

    // Update velocity and position
    velocity += a * dir;
    pos += velocity;

    // After halfway, apply opposite acceleration
    if (pos <= windowWidth*.5) {
      dir = 1;
    }

    // If it reaches the end stop it
    if (pos <= windowWidth*.3) {
      dir = 0;
      velocity = 0;
    }

    translate(0, windowHeight/2);
    translate(pos, boxSize[1]);

    // When it's moving, shear based on velocity.
    if (dir != 0) {
      shearX(map(abs(velocity), 0, 36, 0, -.7));
    } else {
      // Once it's stopped, sway it and apply some dampening
      if (count < 8) {
        shearX(map(Math.cos(count), -1, 1, .3888888888, -.3888888888));
    } else if (count < 23.5) {
        shearX(map(Math.cos(count), -1, 1, 8*.3888888888/count, 8*-.3888888888/count));
      }
      count += .2;
    }

    translate(0, -boxSize[1]);

    rect(0, 0, boxSize[0], boxSize[1]);
}

function draw() {
  // On frame 480 switch principles
  if (frameCount == 480) {
      var newState = state == 1 ? 5 : 1;

      state = newState;

      document.getElementById('title' + newState).style.display = '';
      canvas.style.display = 'none';
      remove();
      window.dispatchEvent(new Event('load'));
  }
  
  if (state == 1) {
      principle1();
  } else if (state == 5) {
      principle5();
  }
}
