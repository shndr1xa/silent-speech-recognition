URL = window.URL || window.webkitURL;
var gumStream;
//stream from getUserMedia() 
var rec;
//Recorder.js object 
var input;
//MediaStreamAudioSourceNode we'll be recording 
// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;

var recordButton = document.getElementsByClassName("mic-button")[0];
var textBlock = document.getElementsByClassName("window-text")[0];

recordButton.addEventListener("mousedown", startRecording);
recordButton.addEventListener('mouseup', function() {
    recordButton.disabled = true;
    setTimeout(stopRecording, 1000)
})

function startRecording(event) {
    var constraints = {
        audio: true,
        video: false
    } 
    /* Disable the record button until we get a success or fail from getUserMedia() */

    // recordButton.disabled = true;

    /* We're using the standard promise based getUserMedia()

    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
    let audioContext = new AudioContext();
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ..."); 
        /* assign to gumStream for later use */
        gumStream = stream;
        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);
        /* Create the Recorder object and configure to record mono sound (1 channel) Recording 2 channels will double the file size */
        rec = new Recorder(input, {
            numChannels: 1
        }) 
        //start the recording process 
        rec.record()
        console.log("Recording started");
    }).catch(function(err) {
        //enable the record button if getUserMedia() fails 
        recordButton.disabled = false;
    });

    // window.setTimeout(stopRecording, 5000)
}

function stopRecording(event) {
    console.log("stop");
    recordButton.disabled = false;
    // recordButton.classList.remove('rec-mod')

    rec.stop(); //stop microphone access 
    gumStream.getAudioTracks()[0].stop();
    //create the wav blob and pass it on to createDownloadLink 
    rec.exportWAV(uploadFile);
}

function uploadFile(blob) {
    var xhr=new XMLHttpRequest();
    xhr.onload=function(e) {
    if(this.readyState === 4) {
        console.log("Server returned: ",e.target.responseText);
        textBlock.innerText = e.target.responseText
    }
    };
    var fd=new FormData();
    fd.append("audio_data",blob, "output");
    xhr.open("POST","audio/",true);
    xhr.send(fd);
}
