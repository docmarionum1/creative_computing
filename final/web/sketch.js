var serial; // variable to hold an instance of the serialport library
var portName = 'COM4'; // fill in your serial port name here
var inData; // for incoming serial data
var LEDState = [];
var numLEDs = 30;
var numRows = 5;
var waveforms = ['sine', 'triangle', 'sawtooth', 'square', 'triangle', 'sawtooth'];
var beatLength = 15;
var synth;
var primes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233
];

class LED {
  constructor(i) {
    this.i = i;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    //this.osc = new p5.Oscillator(parseInt(i/numRows)*17+1, waveforms[parseInt(i%numRows)]);
    this.freq = i*17 + 17;
    this.beatLength = primes[i];
    this.count = 0;
    this.active = false;
    this.playing = false;
    this.button = createButton(' ');
    this.button.position(parseInt(i%numRows)*50, parseInt(i/numRows)*50);
    this.button.mousePressed(this.activate.bind(this));
  }

  activate() {
    this.active = !this.active;
    if (this.active) {
      this.button.elt.style.backgroundColor = 'red';
    } else {
      this.stop();
      this.button.elt.style.backgroundColor = '';
    }
  }

  send() {
    serial.write(this.i);
    serial.write(this.r);
    serial.write(this.g);
    serial.write(this.b);
  }

  /*update(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }*/

  update() {
    this.count++;
    if (this.count == this.beatLength) {
      this.togglePlaying();
      this.count = 0;
    }
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

  start() {
    if (!this.playing && this.active) {
      this.playing = true;
      //this.osc.start();
      this.button.elt.style.backgroundColor = 'blue';
      this.midi = synth.noteOnWithFreq(this.freq, 1000);
    }
  }

  stop() {
    if (this.playing) {
      this.playing = false;
      //this.osc.stop();
      synth.noteOff(this.midi, 1000);
      this.button.elt.style.backgroundColor = 'red';
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
