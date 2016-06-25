var serial; // variable to hold an instance of the serialport library
var portName = 'COM5'; // fill in your serial port name here
var inData; // for incoming serial data
var LEDState = [];
var numLEDs = 30;
var numRows = 5;
var rowLength = numLEDs/numRows;
var synth;
var primes = [
  5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233
];
var inputThresholds = [
    [30, 120],
    [180, 220],
    [300, 360],
    [400, 550],
    [600, 720],
    [850, 970]
];

class Pulse {
  constructor(velocity, direction, i, freq) {
    this.i = i;
    this.velocity = velocity;
    this.direction = direction;
    this.freq = freq;
    this.noteVel = 127;
    this.count = 0;
    this.r = 100+parseInt(freq/100)*50;
    this.g = 100+parseInt(freq%100);
    this.b = 100+parseInt(freq%10)*10;

    this.playing = false;
    this.start();
  }

  // Update the pulse - if it moves, return the new location, else return null
  // if return -1, remove the Pulse
  update() {
    if (++this.count == this.velocity) {
      this.count = 0;
      this.noteVel -= 10;
      var oldLoc = this.i;
      var newLoc = this.i + this.direction;

      if (
        newLoc < 0 || newLoc >= numLEDs ||
        (abs(this.direction) == 1 && parseInt(oldLoc/numRows) != parseInt(newLoc/numRows))
      ) {
        return -1;
      }

      this.i = newLoc;
      return this.i;
    }
    return null;
  }

  togglePlaying() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.playing) {
      this.playing = true;
      this.midi = synth.noteOnWithFreq(this.freq, this.noteVel);
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
      synth.noteOff(this.midi, 100);
    }
  }
}

class LED {
  constructor(i) {
    this.i = i;

    this.r = 0;
    this.g = 0;
    this.b = 0;

    this.freq = 0;//
    this.innateFreq = i*17 + 51;
    this.beatLength = primes[i];
    //this.count = 0;
    //this.active = false;
    this.playing = false;

    this.pulses = [];

    this.button = createButton(' ');
    this.button.position(parseInt(i%numRows)*50, parseInt(i/numRows)*50);
    this.button.mousePressed(this.activate.bind(this));

    this.buttonState = false;
    this.buttonRow = parseInt(i / numLEDs);
    this.buttonIdx = i % numRows;

    // Reverse for odd numbered rows
    if (this.buttonRow % 2 == 1) {
        this.buttonIdx = rowLength - this.buttonIdx;
    }
  }

  processInput(values) {
      var val = values[this.buttonRow];
      if (
          val > inputThresholds[this.buttonIdx][0] &&
          val < inputThresholds[this.buttonIdx][1]
      ) {
          this.updateButtonState(true);
      } else {
          this.updateButtonState(false);
      }
  }

  updateButtonState(state) {
      if (state && state != this.buttonState) {
          this.activate();
      }
      this.buttonState = state;
  }

  activate() {
    var dirs = [-1, 1, numRows, -numRows];
    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i];
      var j = this.i + dir;

      if (
        j >= 0 && j < numLEDs &&
        (abs(dir) != 1 || parseInt(this.i/numRows) == parseInt(j/numRows))
      ) {
        LEDState[j].pulses.push(new Pulse(this.beatLength, dir, j, this.innateFreq));
      }
    }
  }

  send() {
    serial.write(this.i);
    serial.write(this.r);
    serial.write(this.g);
    serial.write(this.b);
  }

  getColor() {
      if (this.pulses.length > 0) {
          var r = 0;
          var g = 0;
          var b = 0;
          var n = this.pulses.length;

          for (var i = 0; i < n; i++) {
              r += this.pulses[i].r;
              g += this.pulses[i].g;
              b += this.pulses[i].b;
          }

          r = parseInt(r/n);
          g = parseInt(g/n);
          b = parseInt(b/n);

          this.r = r;
          this.g = g;
          this.b = b;

          return 'rgb(' + r + ',' + g + ',' + b + ')';
      } else {
          this.r = 0;
          this.g = 0;
          this.b = 0;
          return 'rgb(0,0,0)';
      }
  }

  update() {
    for (var i = this.pulses.length; i--;) {
      var j = this.pulses[i].update();
      if (j !== null) {
        var pulse = this.pulses.splice(i, 1)[0];
        pulse.stop();
        if (j > -1) {
          LEDState[j].pulses.push(pulse);
          pulse.start();
        }
      }
    }
    this.button.elt.style.backgroundColor = this.getColor();
  }
}

function setup() {
  //synth = T("OscGen", {wave:"sin", mul:0.25}).play();
  var env = T("perc", {a:50, r:2500});
  synth = T("PluckGen", {env:env, mul:0.5}).play();

  frameRate(60);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.open(portName, {baudrate: 115200}); // open a serial port
  serial.clear();

  for (var i = 0; i < numLEDs; i++) {
    LEDState[i] = new LED(i);
  }

  // Handshake
  serial.write(1); serial.write(3); serial.write(3); serial.write(7);
}

function sendLED(i) {
  // If we've sent all the LEDs, update the display
  if (++i == numLEDs) {
      serial.write(255);
      serial.write(0);
      serial.write(0);
      serial.write(0);
  } else if (i == 256) {
      // If we've just updated the display, start sending colors from 0 again.
      LEDState[0].send();
  } else {
      LEDState[i].send();
  }

}

function draw() {
    for (var i = 0; i < numLEDs; i++) {
      LEDState[i].update();
    }
}

function processInput(data) {
    var values = data.split(':')[1].split(',');

    for (var i = 0; i < numLEDs; i++) {
        LEDState[i].processInput(values);
    }
}

function serialEvent() {
  // read a byte from the serial port:
  //var inByte = serial.readLine();
  var data = serial.readLine();//readStringUntil('\r\n');

  if (data) {
    // LED message
    if (data.charAt(0) == 'L') {
      //console.log(data);
      sendLED(parseInt(data.split(":")[1]));
    }

    // Debug
    if (data.charAt(0) == 'D') {
      console.log(data);
    }

    // Input
    if (data.charAt(0) == 'I') {
        //console.log(data);
        //processInput(data);
    }
  }
}

function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}
