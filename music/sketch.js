var analyser;
var frequencyData;
var cubeSize = 1;
var a = 0.7;
var cubes = [];
var numCubes = 16;
var freqLength = 1024;
var freqChunk = freqLength/numCubes;
var minSize = 20;
var maxSize = 350;

class Cube {
    constructor(freqStart, freqEnd) {
        this.freqStart = freqStart;
        this.freqEnd = freqEnd;
        this.size = minSize;
        this.min = 50000;
        this.max = 0;
        this.rot = 0;
        this.drot = 0;
        this.previous = [];
    }

    update(frequencyData) {
        // Only use a subset of the frequencies for each cube
        var sum = sumArray(frequencyData, this.freqStart, this.freqEnd);

        // Update min/max range
        if (sum < this.min) {
            this.min = sum;
        }
        if (sum > this.max) {
            this.max = sum;
        }

        // Keep a running array of the last 120 samples for tempo detection
        this.previous.unshift(sum);
        this.previous = this.previous.slice(0, 120);

        // Update the rotation speed based on the tempo
        this.drot = .01 * countPeaks(this.previous);
        this.rot += this.drot;

        // Get the current size based on the amplitude
        var w = map(sum, this.min, this.max, minSize, maxSize);

        // Smooth the size transition
        if (w) {
            this.size = this.size * a + w * (1 - a);
        }

        // Make sure the width is not less than/greater than the min/max
        this.width = max(min(this.size, maxSize), minSize);
    }
}

// Get the sum of an array from index i to j
function sumArray(a, i, j) {
    var s = 0;
    for (var x = i; x < j; x++) {
        s += a[x];
    }
    return s;
}

// Count the number of peaks in a array to estimate tempo
function countPeaks(a) {
    var peaks = 0;
    for (var i = 2; i < a.length - 2; i++) {
        // Considered a peak if the value is greater than it's neighbors up to 2 away.
        if (a[i] > a[i - 1] && a[i] > a[i + 1] && a[i] > a[i - 2] && a[i] > a[i + 2]) {
            peaks++
        }
    }
    return peaks;
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);

    // Create the cubes
    for (var i = 0; i < numCubes; i++) {
        cubes.push(new Cube(i*freqChunk, (i+1)*freqChunk));
    }

    // Set up an event for when the audio file is chosen.
    audio_file.onchange = function() {

        // When it's chosen, hide the upload button
        document.getElementById('upload').style.display = 'none';

        // Create  URL that can be accessed
        var file = URL.createObjectURL(this.files[0]);

        // Load the tags to display the title/artist
        id3(this.files[0], function(err, tags) {
            document.getElementById('title').innerHTML = tags.title;
            document.getElementById('artist').innerHTML = tags.artist;
        });

        // Load the file data
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function() {
            // Decode the data
            var cx = new AudioContext() ;
            cx.decodeAudioData(xhr.response, function(decodedBuffer) {

                // Connect the song to the output (speakers)
                var source = cx.createBufferSource();
                source.buffer = decodedBuffer;
                source.connect(cx.destination);

                // Add an analyser node
                analyser = cx.createAnalyser();
                source.connect(analyser);
                frequencyData = new Uint8Array(analyser.frequencyBinCount);

                // Start playing the song
                source.start(0);
            });
        };
        xhr.send(null);
    };
}

function draw() {
    if (analyser) {
        // Make title fade
        document.getElementById('splash').style.opacity -= 0.01;

        background(0);

        analyser.getByteFrequencyData(frequencyData);

        translate(0, 0, -3000);

        // For each cube update it's size/rotation
        for (var i = 0; i < numCubes; i++) {
            cubes[i].update(frequencyData);

            push();

            // Position the cubes into a grid
            translate(
                500 + (i % (numCubes/4))*1000 - (1000*numCubes/8),
                1000*floor(i / (numCubes/4)) - 1500,
                0
            );

            // Only rotate one of the axes for each cube
            if (i % 3 === 0)
                rotateZ(cubes[i].rot);
            else if (i % 3 === 1)
                rotateX(cubes[i].rot);
            else
                rotateY(cubes[i].rot);

            box(cubes[i].width, cubes[i].width, cubes[i].width);

            pop();
        }
    }
}
