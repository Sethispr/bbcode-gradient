// Slight inspirations from stuffbydavid's text colorizer website
// script.js by seth

const gradientText = document.getElementById("gradient-text");
const startColorInput = document.getElementById("start-color");
const endColorInput = document.getElementById("end-color");
const paletteContainer = document.getElementById("palette");
const fontSelect = document.getElementById("font-select");
const fontSizeSelect = document.getElementById("font-size");
const boldCheckbox = document.getElementById("bold-checkbox");
const italicCheckbox = document.getElementById("italic-checkbox");
const copyButton = document.getElementById("copy-button");
const outputText = document.getElementById("output-text");
const bbcodeOutput = document.getElementById("bbcode-output");

// Function to update color palette
function updatePalette() {
  const startColor = startColorInput.value;
  const endColor = endColorInput.value;
  const gradientTextValue = gradientText.value;
  const paletteColorsCount = Math.min(gradientTextValue.length, 6); // Limit to 6 colors for better view
  paletteContainer.innerHTML = "";

  // Generate and append new palette colors
  for (let i = 0; i < paletteColorsCount; i++) {
    const paletteColor = document.createElement("div");
    paletteColor.className = "palette-color";
    paletteColor.style.backgroundColor = interpolateColor(
      startColor,
      endColor,
      i / Math.max(gradientTextValue.length - 1, 1)
    );
    paletteColor.addEventListener("click", () =>
      setColorFromPalette(paletteColor.style.backgroundColor, i)
    );
    paletteContainer.appendChild(paletteColor);
  }

  updateOutputText();
}

// Update palette and text on input change
gradientText.addEventListener("input", updatePalette);
startColorInput.addEventListener("input", updatePalette);
endColorInput.addEventListener("input", updatePalette);
fontSelect.addEventListener("change", updateOutputText);
fontSizeSelect.addEventListener("change", updateOutputText);
boldCheckbox.addEventListener("change", updateOutputText);
italicCheckbox.addEventListener("change", updateOutputText);

// Initial update
updatePalette();
updateOutputText();
updateBBcodeOutput();

// Function to update output text
function updateOutputText() {
  const selectedFont = fontSelect.value;
  const selectedSize = fontSizeSelect.value;
  const isBold = boldCheckbox.checked;
  const isItalic = italicCheckbox.checked;
  const startColor = startColorInput.value;
  const endColor = endColorInput.value;

  let style = `font-family: ${selectedFont}, sans-serif;`;
  if (selectedSize !== "Default") style += `font-size: ${selectedSize}rem;`;
  if (isBold) style += "font-weight: bold;";
  if (isItalic) style += "font-style: italic;";

  outputText.style = style;
  outputText.innerHTML = DOMPurify.sanitize(
    gradientText.value
      .split("")
      .map((char, index) => {
        const charColor = interpolateColor(
          startColor,
          endColor,
          index / Math.max(gradientText.value.length - 1, 1)
        );
        return `<span style="color: ${charColor}">${char}</span>`;
      })
      .join("")
  );

  // Update font size in the live preview
  if (selectedSize === "Default") {
    outputText.style.removeProperty("font-size");
  }

  updateBBcodeOutput();
}

// Function to set color from palette to color inputs
function setColorFromPalette(color, index) {
  gradientText.focus();
  document.execCommand(
    "insertHTML",
    false,
    `<span style="color: ${color}">${gradientText.value[index]}</span>`
  );
  updatePalette();
  updateOutputText();
  updateBBcodeOutput();
}

// Function to interpolate color between two hex values
function interpolateColor(start, end, percentage) {
  const startColor = hexToRgb(start);
  const endColor = hexToRgb(end);

  const interpolatedColor = {
    r: Math.round(startColor.r + percentage * (endColor.r - startColor.r)),
    g: Math.round(startColor.g + percentage * (endColor.g - startColor.g)),
    b: Math.round(startColor.b + percentage * (endColor.b - startColor.b)),
  };

  return rgbToHex(
    interpolatedColor.r,
    interpolatedColor.g,
    interpolatedColor.b
  );
}

// Function to convert hex color to RGB object
function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

// Function to convert RGB values to hex color
function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Automatically update preview on text input
gradientText.addEventListener("input", function () {
  updatePalette();
  updateOutputText();
  updateBBcodeOutput();
});
// Automatically update preview on changing start color
startColorInput.addEventListener("input", function () {
  updateOutputText();
  updateBBcodeOutput();
});

// Automatically update preview on changing end color
endColorInput.addEventListener("input", function () {
  updateOutputText();
  updateBBcodeOutput();
});
// Function to generate BBcode based on selected options
function generateBBcode() {
  const selectedFont = fontSelect.value;
  const selectedSize = fontSizeSelect.value;
  const isBold = boldCheckbox.checked;
  const isItalic = italicCheckbox.checked;
  const startColor = startColorInput.value;
  const endColor = endColorInput.value;
  const text = gradientText.value;

  let bbcode = "";

  if (isBold) bbcode += "[b]";
  if (isItalic) bbcode += "[i]";
  if (selectedFont !== "Default") bbcode += `[font="${selectedFont}"]`;
  if (selectedSize !== "Default") bbcode += `[size=${selectedSize * 100}]`;

  for (let i = 0; i < text.length; i++) {
    const charColor = interpolateColor(
      startColor,
      endColor,
      i / Math.max(text.length - 1, 1)
    );
    bbcode += `[color=${charColor}]${text[i]}[/color]`;
  }

  if (selectedSize !== "Default") bbcode += "[/size]";
  if (selectedFont !== "Default") bbcode += "[/font]";
  if (isItalic) bbcode += "[/i]";
  if (isBold) bbcode += "[/b]";

  return bbcode;
}

// Function to update BBcode output
function updateBBcodeOutput() {
  bbcodeOutput.innerText = generateBBcode();
}

// Control buttons for copy and clear
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "x") {
    copyToClipboard();
  } else if (event.ctrlKey && event.key === "y") {
    clearTextarea();
  }
});

function clearTextarea() {
  var gradientText = document.getElementById("gradient-text");
  gradientText.value = "";
  alert("Text will be cleared!");
}

document.addEventListener("DOMContentLoaded", function () {
  // Add copy icon for bbcode-output
  addCopyIcon("#bbcode-output", copyToClipboard);
});

function addCopyIcon(selector, onClick) {
  var container = document.querySelector(selector);

  if (!container) {
    console.error("Container element not found");
    return;
  }

  var copyIcon = document.createElement("i");
  copyIcon.className = "fas fa-copy copy-icon";
  container.appendChild(copyIcon);

  copyIcon.addEventListener("click", function () {
    onClick();
  });
}

function copyToClipboard() {
  var bbcodeOutput = document.getElementById("bbcode-output");
  bbcodeOutput.select();
  bbcodeOutput.setSelectionRange(0, 99999);
  document.execCommand("copy");
  bbcodeOutput.setSelectionRange(0, 0);
  alert("Text copied to clipboard!");
}

