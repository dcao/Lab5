// script.js

var img = new Image(); // used to load image from <input> and draw to canvas

var btnGen = document.querySelector('button[type=submit]');
var btnReset = document.querySelector('button[type=reset]');
var btnRead = document.querySelector('button[type=button]');

var form = document.getElementById("generate-meme");

var imgIn = document.getElementById("image-input");

var volGrp = document.getElementById("volume-group");

// Fires whenever the img object loads a new image (such as with img.src =)
img.onload = function() {
    let canvas = document.getElementById("user-image");
    let ctx = canvas.getContext("2d");

    // clear context
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // fill with black
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();

    // set buttons
    btnGen.disabled = false;
    btnRead.disabled = true;
    btnReset.disabled = true;

    // draw image
    let dims = getDimensions(canvas.width, canvas.height, img.width, img.height);
    ctx.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);
};

imgIn.addEventListener("change", () => {
    let fr = new FileReader();
    fr.onload = function() {
        img.src = fr.result;
    };
    fr.readAsDataURL(imgIn.files[0]);
    img.alt = imgIn.files[0];
});

btnReset.addEventListener("click", () => {
    // reset
    let canvas = document.getElementById("user-image");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById("text-top").value = "";
    document.getElementById("text-bottom").value = "";
    
    // set buttons
    btnGen.disabled = false;
    btnRead.disabled = true;
    btnReset.disabled = true;
});

form.addEventListener("submit", (e) => {
    let canvas = document.getElementById("user-image");
    let ctx = canvas.getContext("2d");

    // Write text
    ctx.font = "48px sans-serif";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";

    // Top text
    let top = document.getElementById("text-top").value;
    ctx.fillText(top, canvas.width / 2, canvas.height * 0.15);
    ctx.strokeText(top, canvas.width / 2, canvas.height * 0.15);

    let bottom = document.getElementById("text-bottom").value;
    ctx.fillText(bottom, canvas.width / 2, canvas.height * 0.95);
    ctx.strokeText(bottom, canvas.width / 2, canvas.height * 0.95);

    // set buttons
    btnGen.disabled = true;
    btnRead.disabled = false;
    btnReset.disabled = false;

    e.preventDefault();
});

btnRead.addEventListener("click", () => {
    let top = document.getElementById("text-top").value;
    let bottom = document.getElementById("text-bottom").value;

    var utterThis = new SpeechSynthesisUtterance(top);
    var utterThat = new SpeechSynthesisUtterance(bottom);
    var selectedOption = document.querySelector("#voice-selection").selectedOptions[0].getAttribute('data-name');
    for (var i = 0; i < voices.length ; i++) {
        if(voices[i].name === selectedOption) {
            utterThis.voice = voices[i];
            utterThat.voice = voices[i];
        }
    }

    utterThis.volume = Number(volGrp.children[1].value) / 100;
    utterThat.volume = Number(volGrp.children[1].value) / 100;

    let synth = window.speechSynthesis;
    synth.speak(utterThis);
    synth.speak(utterThat);
});

var voices = [];
function populateVoiceList() {
    let selector = document.querySelector("#voice-selection");
    selector.removeChild(selector.children[0]);
    selector.disabled = false;
    console.log("selector");
    
    let synth = window.speechSynthesis;
    voices = synth.getVoices();

    console.log(voices);

    for (var i = 0; i < voices.length ; i++) {
        var option = document.createElement('option');
        option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

        if (voices[i].default) {
            option.textContent += ' -- DEFAULT';
        }

        option.setAttribute('data-lang', voices[i].lang);
        option.setAttribute('data-name', voices[i].name);
        selector.appendChild(option);
    }
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

var volume = 100;
volGrp.addEventListener("input", () => {
    let icon = volGrp.children[0];
    let s = volGrp.children[1];

    if (s.value >= 67) {
        icon.src = "icons/volume-level-3.svg";
        icon.alt = "Volume Level 3";
    } else if (s.value >= 34) {
        icon.src = "icons/volume-level-2.svg";
        icon.alt = "Volume Level 2";
    } else if (s.value >= 1) {
        icon.src = "icons/volume-level-1.svg";
        icon.alt = "Volume Level 1";
    } else {
        icon.src = "icons/volume-level-0.svg";
        icon.alt = "Volume Level 0";
    }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
    let aspectRatio, height, width, startX, startY;

    // Get the aspect ratio, used so the picture always fits inside the canvas
    aspectRatio = imageWidth / imageHeight;

    // If the apsect ratio is less than 1 it's a verical image
    if (aspectRatio < 1) {
        // Height is the max possible given the canvas
        height = canvasHeight;
        // Width is then proportional given the height and aspect ratio
        width = canvasHeight * aspectRatio;
        // Start the Y at the top since it's max height, but center the width
        startY = 0;
        startX = (canvasWidth - width) / 2;
        // This is for horizontal images now
    } else {
        // Width is the maximum width possible given the canvas
        width = canvasWidth;
        // Height is then proportional given the width and aspect ratio
        height = canvasWidth / aspectRatio;
        // Start the X at the very left since it's max width, but center the height
        startX = 0;
        startY = (canvasHeight - height) / 2;
    }

    return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
