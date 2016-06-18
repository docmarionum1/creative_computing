var analyser;
var frequencyData;

function sumArray(a, i, j) {
  var s = 0;
  for (var x = i; x < j; x++) {
    s += a[x];
  }
  return s;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

  audio_file.onchange = function() {
      audio_file.style.display = 'none';
      var file = URL.createObjectURL(this.files[0]);
      var xhr = new XMLHttpRequest();
      xhr.open('GET', file, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = function() {
        var start = (new Date()).getTime();
        var cx = new AudioContext() ;
        cx.decodeAudioData(xhr.response, function(decodedBuffer) {
          console.log(decodedBuffer.numberOfChannels);
          console.log((new Date()).getTime() - start);
          //var offlineContext = new OfflineContext(decodedBuffer.numberOfChannels, decodedBuffer.length, decodedBuffer.sampleRate);

          var source = cx.createBufferSource();
          source.buffer = decodedBuffer;
          source.connect(cx.destination);

          analyser = cx.createAnalyser();
          source.connect(analyser);
          frequencyData = new Uint8Array(analyser.frequencyBinCount);
          source.start(0);

          /*offlineContext.decodeAudioData(request.response, function(buffer) {
            var source = offlineContext.createBufferSource();
            source.buffer = buffer;
            source.start(0);
          });*/
        });
      }
      xhr.send(null);
  }
}

function draw() {
  if (analyser) {
    analyser.getByteFrequencyData(frequencyData);
    var sum = sumArray(frequencyData, 0, frequencyData.length);
    console.log(sum);
    background(255);
    //scale(sum/10000, sum/10000);
    var w = 10 * sum/5000;
    rect(width/2 - w/2, height/2 - w/2, w, w);
  }
}
