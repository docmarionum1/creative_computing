var serial; // variable to hold an instance of the serialport library
var portName = 'COM4'; // fill in your serial port name here
var inData; // for incoming serial data
var LEDState = [];
var numLEDs = 30;
var numRows = 5;
var rowLength = numLEDs/numRows;
var waveforms = ['sine', 'triangle', 'sawtooth', 'square', 'triangle', 'sawtooth'];
var beatLength = 15;
var synth;
var primes = [
  5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233
];

class Pulse {
  constructor(velocity, direction, i, freq) {
    this.i = i;
    this.velocity = velocity;
    this.direction = direction;
    this.freq = freq;
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
      var oldLoc = this.i;
      var newLoc = this.i + this.direction;

      //this.i += this.direction;
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
      this.midi = synth.noteOnWithFreq(this.freq, 100);
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
    //this.osc = new p5.Oscillator(parseInt(i/numRows)*17+1, waveforms[parseInt(i%numRows)]);
    this.freq = 0;//
    this.innateFreq = i*17 + 17;
    this.beatLength = primes[i];
    this.count = 0;
    this.active = false;
    this.playing = false;
    this.button = createButton(' ');
    this.button.position(parseInt(i%numRows)*50, parseInt(i/numRows)*50);
    this.button.mousePressed(this.activate.bind(this));
    this.pulses = [];
  }

  activate() {
    /*this.active = !this.active;
    if (this.active) {
      this.button.elt.style.backgroundColor = 'red';
    } else {
      this.stop();
      this.button.elt.style.backgroundColor = '';
    }*/
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

      /*
      if (j > -1 && j < numLEDs) {
        LEDState[j].pulses.push(new Pulse(this.beatLength, dir, j, this.innateFreq));
      }*/
    }
  }

  send() {
    serial.write(this.i);
    serial.write(this.r);
    serial.write(this.g);
    serial.write(this.b);
  }

  getFreq() {
    var sum = 0;
    for (var i = 0; i < this.pulses.length; i++) {
      sum += this.pulses[i].freq;
    }
    return sum;
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

          //return 'rgb(' + min(r,256) + ',' + min(g,256) + ',' + min(b,256) + ')';
          return 'rgb(' + parseInt(r/n) + ',' + parseInt(g/n) + ',' + parseInt(b/n) + ')';
      } else {
          return 'rgb(0,0,0)';
      }

  }

  /*update(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }*/

  update() {
    /*this.count++;
    if (this.count == this.beatLength) {
      this.togglePlaying();
      this.count = 0;
    }*/
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

    /*var freq = this.getFreq();
    if (this.freq != freq) {
      this.stop();
      if (freq == 0) {

      } else {
        this.start(freq)
      }
    }
    this.freq = freq;*/

    /*if (this.freq != 0) {
      this.button.elt.style.backgroundColor = 'blue';
    } else {
      this.button.elt.style.backgroundColor = 'red';
  }*/
    this.button.elt.style.backgroundColor = this.getColor();
  }

  inc() {
    this.r++;
    this.g++;
    this.b++;
  }

  togglePlaying() {
    if (this.playing) {
      this.stop();
    } else {
      this.start();
    }
  }

  start(freq) {
    if (!this.playing) {
      this.playing = true;
      //this.osc.start();
      //this.button.elt.style.backgroundColor = 'blue';
      this.midi = synth.noteOnWithFreq(freq, 100);
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
      //this.osc.stop();
      synth.noteOff(this.midi, 100);
      //this.button.elt.style.backgroundColor = 'red';
    }
  }
}

function preload() {
  mySound = loadSound('witch.wav');
}

function setup() {
  synth = T("OscGen", {wave:"saw", mul:0.25}).play();
  frameRate(60);
  //createCanvas(400, 300);
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors

  serial.open(portName, {baudrate: 115200}); // open a serial port
  serial.clear();

  for (var i = 0; i < numLEDs; i++) {
    LEDState[i] = new LED(i);
    //LEDState[i].update(0,0,0);
  }

  serial.write(1); serial.write(3); serial.write(3); serial.write(7);

  /*osc = new p5.Oscillator();
  osc.setType('sawtooth');
  osc.freq(100000);
  osc.amp(1);
  osc.start();
  playing = true;
  /*mySound.setVolume(2);
  mySound.loop();

  fft = new p5.FFT();
  fft.setInput(osc);*/
}

function sendLED(i) {
  i = (i + 1) % numLEDs;
  LEDState[i].send();

  /*if (i < numLEDs) {
    LEDState[i].send();
  } else {

  }*/
}

function draw() {
  /*if (frameCount % 60 && playing) {
    playing = false;
    osc.stop();
  } else if (frameCount % 60 == 0) {
    osc.start();
    playing = true;
  }*/
  // black background, white text:
  /*fft.analyze();
  //background(fft.getEnergy('bass', 'treble'));// > 0 ? 255 : 0);
  background(playing ? 255 : 0);
  inData = fft.getEnergy('bass', 'treble');
  fill(255);
  // display the incoming serial data as a string:
  text("incoming value: " + inData, 30, 30);*/
  /*for (var i = 0; i < numLEDs; i++) {
    //LEDState[i].update(frameCount % 256, frameCount % 128, frameCount % 64);
    LEDState[i].update(i, i, i);
  }*/
  //LEDState[frameCount % numLEDs].inc();
  /*for (var i = 0; i < numLEDs; i++) {
    if (parseInt((frameCount % (beatLength*numLEDs)) / beatLength) == i) {
      playing = i;
      LEDState[i].start();
    } else {
      LEDState[i].stop();
    }
  }*/
    for (var i = 0; i < numLEDs; i++) {
      LEDState[i].update();
    }

  //background(0);
  //fill(255);
  //text("incoming value: " + playing, 30, 30)
}

function serialEvent() {
  // read a byte from the serial port:
  //var inByte = serial.readLine();
  var data = serial.readLine();//readStringUntil('\r\n');

  //println("inByte: " + inByte);
  if (data) {
    //console.log(data);
    //inData = data;

    if (data.charAt(0) == 'L') {
      //console.log(data);
      sendLED(parseInt(data.split(":")[1]));
    }

    if (data.charAt(0) == 'D') {
      inData = data;
      console.log(data);
    }
  }

  //console.log(inByte);
}

function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}
