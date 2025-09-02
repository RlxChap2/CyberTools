// Preview Image on Canvas
function previewImage(file, canvasSelector, callback) {
  const reader = new FileReader();
  const image = new Image();
  const canvas = document.querySelector(canvasSelector);
  const ctx = canvas.getContext("2d");

  if (file) reader.readAsDataURL(file);

  reader.onloadend = () => {
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      callback();
    };
  };
}

// Encode message inside image
function encodeMessage() {
  const text = document.getElementById("encodeText").value;
  const canvas = document.getElementById("encodeCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  if (!text) {
    alert("Please enter a message!");
    return;
  }

  if (text.length * 8 > width * height * 3) {
    alert("Text too long for chosen image!");
    return;
  }

  // Normalize image (LSB = 0)
  const original = ctx.getImageData(0, 0, width, height);
  let pixels = original.data;
  for (let i = 0; i < pixels.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      if (pixels[i + offset] % 2 !== 0) pixels[i + offset]--;
    }
  }
  ctx.putImageData(original, 0, 0);

  // Convert message to binary
  let binaryMessage = "";
  for (let i = 0; i < text.length; i++) {
    let bin = text[i].charCodeAt(0).toString(2).padStart(8, "0");
    binaryMessage += bin;
  }

  // Apply binary string to pixels
  const messageData = ctx.getImageData(0, 0, width, height);
  pixels = messageData.data;
  let counter = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      if (counter < binaryMessage.length) {
        pixels[i + offset] += parseInt(binaryMessage[counter]);
        counter++;
      }
    }
  }
  ctx.putImageData(messageData, 0, 0);

  // Download encoded image
  const link = document.getElementById("downloadLink");
  link.href = canvas.toDataURL();
  link.download = "encoded.png";
  link.classList.remove("hidden");
  link.textContent = "Download Encoded Image";
}

// Decode message from image
function decodeMessage() {
  const canvas = document.getElementById("decodeCanvas");
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imgData.data;

  let binaryMessage = "";
  for (let i = 0; i < pixels.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      binaryMessage += (pixels[i + offset] % 2).toString();
    }
  }

  let output = "";
  for (let i = 0; i < binaryMessage.length; i += 8) {
    let byte = binaryMessage.slice(i, i + 8);
    if (byte.length < 8) continue;
    const charCode = parseInt(byte, 2);
    if (charCode === 0) continue;
    output += String.fromCharCode(charCode);
  }

  document.getElementById("decodedText").textContent =
    output || "No hidden message found.";
}

// Image upload handlers
document.getElementById("encodeImage").addEventListener("change", (e) => {
  previewImage(e.target.files[0], "#encodeCanvas", () => {
    console.log("Image ready for encoding");
  });
});

document.getElementById("decodeImage").addEventListener("change", (e) => {
  previewImage(e.target.files[0], "#decodeCanvas", () => {
    console.log("Image ready for decoding");
  });
});

document.getElementById("encodeBtn").addEventListener("click", encodeMessage);
document.getElementById("decodeBtn").addEventListener("click", decodeMessage);
