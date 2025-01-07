function mod(a, b) {
  return ((a % b) + b) % b;
};

function randint(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

// Function to download data to a file
function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
  }
}

const loadInput = document.getElementById("loadInput");
const loadButton = document.getElementById("loadButton");

loadButton.addEventListener(
  "click",
  (e) => {
    if (loadInput) {
      loadInput.click();
    }
  },
  false,
);

loadInput.addEventListener("change", load, false);
function load() {
  if (this.files.length) {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      document.getElementById("file").value = evt.target.result;
    };
    reader.readAsText(file);
  }
}

const stdinArea = document.getElementById("stdin");
const stdinROEC = document.getElementById("resumeOnEnter");
stdinArea.addEventListener("keyup", function (e) {
  console.log(e, lastStepType);
  if (e.key === "Enter"
    && stdinROEC.checked
    && lastStepType == "run"
  ) {  //checks whether the pressed key is "Enter"
    run();
  }
});

var FILE = "";
var STDIN = "";
var STDOUT = "";
var lastStepType = "none";

FILE = ``;
STDIN = ``;

const escapeSequences = {
  0: 0,
  b: 8,
  t: 9,
  n: 10,
  v: 11,
  f: 12,
  r: 13,
  '"': 34,
  "'": 39,
  '\\': 92
};

const controlCharacters = { 0x00: "␀", 0x01: "␁", 0x02: "␂", 0x03: "␃",
  0x04: "␄", 0x05: "␅", 0x06: "␆", 0x07: "␇", 0x08: "␈", 0x09: "␉", 0x0A: "␊",
  0x0B: "␋", 0x0C: "␌", 0x0D: "␍", 0x0E: "␎", 0x0F: "␏", 0x10: "␐", 0x11: "␑",
  0x12: "␒", 0x13: "␓", 0x14: "␔", 0x15: "␕", 0x16: "␖", 0x17: "␗", 0x18: "␘",
  0x19: "␙", 0x1A: "␚", 0x1B: "␛", 0x1C: "␜", 0x1D: "␝", 0x1E: "␞", 0x1F: "␟",
  0x80: "PAD", 0x81: "HOP", 0x82: "BPH", 0x83: "NBH", 0x84: "IND",
  0x85: "NEL", 0x86: "SSA", 0x87: "ESA", 0x88: "HTS", 0x89: "HTJ",
  0x8A: "VTS", 0x8B: "PLD", 0x8C: "PLU", 0x8D: "RI", 0x8E: "SS2", 0x8F: "SS3",
  0x90: "DCS", 0x91: "PU1", 0x92: "PU2", 0x93: "STS", 0x94: "CCH", 0x95: "MW",
  0x96: "SPA", 0x97: "EPA", 0x98: "SOS", 0x99: "SGCI", 0x9A: "SCI",
  0x9B: "CSI", 0x9C: "ST", 0x9D: "OSC", 0x9E: "PM", 0x9F: "APC" };

var stack = {};
var calls = [];
var functions = {};
var bsp = 0;
var sp = 0;
var i = 0;

var repeatID;

function run() {
  if (FILE !== document.getElementById('file').value || i >= FILE.length) {
    reset();
  }
  document.getElementById('status').textContent = "Running";
  if (repeatID !== undefined) {
    clearTimeout(repeatID);
    repeatID = undefined;
  }
  if (!document.getElementById('fastmode').checked) {
    STDIN = document.getElementById('stdin').value;
    function nextStep() {
      if (i < FILE.length && !(STDIN.length === 0 && FILE[i] === 'i')) {
        doStep();
        document.getElementById('status').textContent = "Running";
        repeatID = setTimeout(nextStep, document.getElementById('speed').value);
      } else {
        document.getElementById('status').textContent = "Not Running";
        if (STDIN.length === 0 && FILE[i] === 'i') {
          document.getElementById('status').textContent = "Halted (Waiting for Input)";
        }
        repeatID = undefined;
      }
    }
    nextStep();
  } else {
    STDIN = document.getElementById('stdin').value;
    while (i < FILE.length && !(STDIN.length === 0 && FILE[i] === 'i')) {
      step();
    }
    document.getElementById('status').textContent = "Not Running";
    if (STDIN.length === 0 && FILE[i] === 'i') {
      document.getElementById('status').textContent = "Halted (Waiting for Input)";
    }
    document.getElementById('stdin').value = STDIN;
    document.getElementById('stdout').value = STDOUT;
    document.getElementById('registers').textContent =
      `BSP: ${bsp}  SP: ${sp}  IP: ${i}`;
    var stackl1 = ""
    var stackl2 = ""
    for (var j = bsp; j < sp; j++) {
      stackl1 += stack[j] + " "
      stackl2 += controlCharacters[stack[j]] ?? String.fromCharCode(stack[j])
      for (var _ = 0; _ < (stack[j].toString().length) - String.fromCharCode(
          stack[j]).length; _++) {
        stackl2 += " "
      }
      stackl2 += " "
    }
    document.getElementById('stack').value = stackl1 + "\n" + stackl2;
  }
}

function reset() {
  if (repeatID !== undefined){
    clearTimeout(repeatID);
    repeatID = undefined;
  }
  stack = {};
  calls = [];
  functions = {};
  bsp = 0;
  sp = 0;
  i = 0;
  FILE = document.getElementById('file').value;
  STDIN = document.getElementById('stdin').value;
  STDOUT = "";
  document.getElementById('stdout').value = STDOUT;
  document.getElementById('registers').textContent =
    `BSP: ${bsp}  SP: ${sp}  IP: ${i}`;
  document.getElementById('stack').value = "";
  document.getElementById('status').textContent = "Not Running";
}

/*
console.log('OUTPUT:\n'+STDOUT);
console.log('BSP: '+bsp, 'SP: '+sp, 'IP: '+i)
for (var i = bsp; i < sp; i++) {
  console.log(i+": "+stack[i])
}
*/

function stop() {
  clearTimeout(repeatID);
  repeatID = undefined;
  document.getElementById('status').textContent = "Halted";
  if (i >= FILE.length) {
    document.getElementById('status').textContent = "Not Running";
  }
}

function doStep() {
  STDIN = document.getElementById('stdin').value;
  if (i < FILE.length) {
    step();
  }
  document.getElementById('stdin').value = STDIN;
  document.getElementById('stdout').value = STDOUT;
  document.getElementById('registers').textContent =
    `BSP: ${bsp}  SP: ${sp}  IP: ${i}`;
  var stackl1 = ""
  var stackl2 = ""
  for (var j = bsp; j < sp; j++) {
    stackl1 += stack[j] + " "
    stackl2 += controlCharacters[stack[j]] ?? String.fromCharCode(stack[j])
    for (var _ = 0; _ < (stack[j].toString().length) - String.fromCharCode(
        stack[j]).length; _++) {
      stackl2 += " "
    }
    stackl2 += " "
  }
  document.getElementById('stack').value = stackl1 + "\n" + stackl2;
  document.getElementById('status').textContent = "Halted";
  if (STDIN.length === 0 && FILE[i] === 'i') {
    document.getElementById('status').textContent = "Halted (Waiting for Input)";
  }
  if (i >= FILE.length) {
    document.getElementById('status').textContent = "Not Running";
  }
}

function step() {
  while (i < FILE.length && FILE[i].match(/\s/)) {
    i++;
  }
  if (i >= FILE.length) {
    return;
  }
  if ("0" <= FILE[i] && FILE[i] <= "9") {
    var v = 0;
    do {
      v = v * 10 + FILE.charCodeAt(i) - 48;
      i++;
    } while ("0" <= FILE[i] && FILE[i] <= "9" && i < FILE.length)
    stack[sp++] = v;
    i--;
  } else switch (FILE[i]) {
    case ',':
      break;
    case 'x':
      sp--;
      break;
    case 'i':
      if (STDIN.length) {
        stack[sp++] = STDIN.charCodeAt(0);
        STDIN = STDIN.substring(1);
      } else {
        i--;
      }
      break;
    case 'p':
      STDOUT += String.fromCharCode(stack[--sp]);
      break;
    case 's':
      [stack[sp - 2], stack[sp - 1]] = [stack[sp - 1], stack[sp - 2]]
      break;
    case 'r':
      var rotate = stack[--sp];
      if (rotate > 0) {
        for (var _ = 0; _ < rotate; _++) {
          var value = stack[sp - 1];
          for (var j = sp; j > bsp; j--) {
            stack[j] = stack[j - 1];
          }
          stack[bsp] = value;
        }
      } else if (rotate < 0) {
        for (var _ = 0; _ < -rotate; _++) {
          var value = stack[bsp];
          for (var j = bsp; j < sp; j++) {
            stack[j] = stack[j + 1];
          }
          stack[sp - 1] = value;
        }
      }
      break;
    case 'd':
      stack[sp] = stack[sp - 1];
      sp++;
      break;
    case '+':
      sp--;
      stack[sp - 1] = stack[sp - 1] + stack[sp];
      break;
    case '-':
      sp--;
      stack[sp - 1] = stack[sp - 1] - stack[sp];
      break;
    case '*':
      sp--;
      stack[sp - 1] = stack[sp - 1] * stack[sp];
      break;
    case '/':
      sp--;
      stack[sp - 1] = Math.floor(stack[sp - 1] / stack[sp]);
      break;
    case '^':
      sp--;
      stack[sp - 1] = stack[sp - 1] ** stack[sp];
      break;
    case '%':
      sp--;
      stack[sp - 1] = mod(stack[sp - 1], stack[sp]);
      break;
    case '&':
      sp--;
      stack[sp - 1] = stack[sp - 1] & stack[sp];
      break;
    case '|':
      sp--;
      stack[sp - 1] = stack[sp - 1] | stack[sp];
      break;
    case '\'':
      sp--;
      stack[sp - 1] = stack[sp - 1] ^ stack[sp];
      break;
    case '~':
      stack[sp - 1] = -stack[sp - 1];
      break;
    case '!':
      stack[sp - 1] = ~stack[sp - 1];
      break;
    case '=':
      sp--;
      stack[sp - 1] = stack[sp - 1] === stack[sp] ? -1 : 0;
      break;
    case '>':
      sp--;
      stack[sp - 1] = stack[sp - 1] > stack[sp] ? -1 : 0;
      break;
    case '<':
      sp--;
      stack[sp - 1] = stack[sp - 1] < stack[sp] ? -1 : 0;
      break;
    case '[':
      if (stack[--sp]) {
        calls.push(i)
      } else {
        var unbalanced = 1;
        while (i < FILE.length && unbalanced) {
          i++;
          if (FILE[i] === '[') {
            unbalanced++;
          } else if (FILE[i] === ']') {
            unbalanced--;
          }
        }
      }
      break;
    case ']':
      if (stack[--sp]) {
        i = calls.at(-1);
      } else {
        calls.pop();
      }
      break;
    case 'c':
      stack[sp] = sp;
      sp++;
      break;
    case 'b':
      stack[sp++] = bsp;
      break;
    case 'C':
      sp = stack[sp - 1];
      break;
    case 'B':
      bsp = stack[--sp];
      break;
    case '"':
      i++;
      while (FILE[i] !== '"') {
        if (FILE[i] === '\\') {
          i++;
          if (FILE[i] !== '\n') {
            stack[sp++] = escapeSequences[FILE[i]]
          }
        } else {
          stack[sp++] = FILE.charCodeAt(i);
        }
        i++;
      }
      break;
    case '(':
      var name = "";
      i++;
      while (FILE[i] !== ':') {
        name += FILE[i];
        i++;
      }
      functions[name.trim()] = i;
      while (FILE[i] !== ')') {
        i++;
      }
      break;
    case ')':
      i = calls.pop();
      break;
    case '{':
      var name = "";
      i++;
      while (FILE[i] !== '}') {
        name += FILE[i];
        i++;
      }
      calls.push(i);
      i = functions[name];
      break;
    case 'z':
      STDOUT = "";
      break;
    case '?':
      sp--;
      stack[sp-1] = randint(stack[sp-1], stack[sp]);
      break;
  }
  i++;
}

async function copyOutput(text) {
  try {
    await navigator.clipboard.writeText(STDOUT);
  } catch (error) {
    console.error(error.message);
  }
}

reset();
run();
