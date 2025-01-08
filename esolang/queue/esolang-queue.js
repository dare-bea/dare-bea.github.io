var stdin = "";
var program = "";
//"1[idd[p0r]]";
//"1[idds[1r[d10r10/r%rds]xS1-[e48+pS1-]112p0]e]";
//"72p101p108p108p111p44p32p119p111p114p108p100p33p";
/*`50p94p 1 63rd ss
  1r[d10r10/r%rds]xS2-[e48+pS2-]
  32p61p32p
ee
rdr[2r*1r-dr]x 1r[d10r10/r%rds]xS[e48+pS]`;*/
/*`1d[
  ds1r[d10r10/r%rds]xS1-[e48+pS1-]e
    32p98p111p116p116p108p101p115p32p111p102p32p98p101p101p114p
    32p111p110p32p116p104p101p32p119p97p108p108p44p10p
  ds1r[d10r10/r%rds]xS1-[e48+pS1-]e
    32p98p111p116p116p108p101p115p
    32p111p102p32p98p101p101p114p46p10p
  84p97p107p101p32p111p110p101p32p100p111p119p110p44p32p112p97p115p115p
    32p105p116p32p97p114p111p117p110p100p44p10p
  1-ds1r[d10r10/r%rds]xS1-[e48+pS1-]e
    32p98p111p116p116p108p101p115p32p111p102p32p98p101p101p114p
    32p111p110p32p116p104p101p32p119p97p108p108p46p10p
d]`;*/

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
    pressRun();
  }
});

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

var lastStepType = "none";

function Int(value) {
  return BigInt.asUintN(bits, typeof value === "bigint" ? value : BigInt(value));
}

const bits = 64;
const memory = {};

var stdout = "";
var pc = 0;
var iqp = 0;
var oqp = 0;

var repeatId;
function pressRun () {
  if (program !== document.getElementById('program').value || pc >= program.length) {
    reset();
  }
  if (repeatId !== undefined) {
    clearTimeout(repeatId);
    repeatId = undefined;
  }
  stdin = document.getElementById('stdin').value;
  document.getElementById('status').value = "Running";
  
  if (!document.getElementById('fastmode').checked) {
    function nextStep() {
      if (pc < program.length) {
        pressStep();
        repeatId = setTimeout(nextStep, document.getElementById('speed').value);
      } else {
        repeatId = undefined;
        var lastStepType = "none";
        document.getElementById('status').value = "Not Running";
      }
    }
    nextStep();
  } else {
    while (pc < program.length) {
      step();
      if (stdin.length === 0 && program[pc] === 'i') {
        break;
      }
    }
    if (pc >= program.length) {
      var lastStepType = "none";
      document.getElementById('status').value = "Not Running";
    } else {
      document.getElementById('status').value = "Halted (Waiting for Input)";
    }
    document.getElementById('stdin').value = stdin;
    document.getElementById('stdout').value = stdout;
    document.getElementById('registers').textContent =
      `OQP: ${oqp}  IQP: ${iqp}  PC: ${pc}`;
    var queuel1 = "";
    var queuel2 = "";
    var char = "";
    for (var j = oqp; j < iqp; j++) {
      queuel1 += memory[j] + " ";
      if (memory[j] < 0x110000) {
        char = controlCharacters[memory[j]] ?? String.fromCodePoint(Number(memory[j]));
      } else {
        char = " ";
      }
      queuel2 += char;
      for (var _ = 0; _ < (memory[j].toString().length) - char.length; _++) {
        queuel1 += " ";
      }
      queuel2 += " ";
    }
    document.getElementById('queue').value = queuel1 + "\n" + queuel2;
  }
}

function pressStep() {
  stdin = document.getElementById('stdin').value;
  if (pc < program.length) {
    step();
    document.getElementById('status').value = "Halted";
  }
  if (pc >= program.length) {
    document.getElementById('status').value = "Not Running";
  }
  document.getElementById('stdin').value = stdin;
  document.getElementById('stdout').value = stdout;
  
  document.getElementById('registers').textContent =
    `OQP: ${oqp}  IQP: ${iqp}  PC: ${pc}`;
  var queuel1 = "";
  var queuel2 = "";
  var char = "";
  for (var j = oqp; j < iqp; j++) {
    queuel1 += memory[j] + " ";
    if (memory[j] < 0x110000) {
      char = controlCharacters[memory[j]] ?? String.fromCodePoint(Number(memory[j]));
    } else {
      char = " ";
    }
    queuel2 += char;
    for (var _ = 0; _ < (memory[j].toString().length) - char.length; _++) {
      queuel2 += " ";
    }
    queuel2 += " ";
  }
  document.getElementById('queue').value = queuel1 + "\n" + queuel2;
}

function stop() {
  document.getElementById('status').value = "Halted";
  if (pc >= program.length) {
    document.getElementById('status').value = "Not Running";
  }
  clearTimeout(repeatID);
  repeatID = undefined;
}

function reset () {
  stop();
  stdout = "";
  pc = 0;
  iqp = 0;
  oqp = 0;
  program = document.getElementById('program').value;
  stdin = document.getElementById('stdin').value;
  document.getElementById('stdout').value = stdout;
  document.getElementById('status').value = "Not Running";
}

function step () {
  if (pc < program.length && "0" <= program[pc] && program[pc] <= "9") {
    var value = 0;
    while (pc < program.length
           && "0" <= program[pc] && program[pc] <= "9") {
      value = value * 10 + program.codePointAt(pc) - 48;
      pc++;
    }
    memory[iqp++] = Int(value);
  }
  if (pc < program.length) {
    // console.log(program[pc])
    switch (program[pc]) {
      case "x":
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        break;
      case "s":
        oqp++;
        break;
      case "e":
        oqp--;
        break;
      case "S":
        memory[iqp++] = Int(oqp);
        break;
      /*case "Q":
        memory[iqp++] = Int(iqp);
        break;*/
      case "r":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        }
        memory[iqp-1] = value;
        break;
      case "d":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        }
        memory[iqp-1] = value;
        memory[iqp++] = value;
        break;
      case "[":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        if (!value) {
          var paren = 1;
          while (paren && pc+1 < program.length) {
            pc++;
            paren += (
              program[pc] === "[" ? 1
              : program[pc] === "]" ? -1
              : 0
            );
          }
        }
        break;
      case "]":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        if (value) {
          var paren = 1;
          while (paren && pc > 0) {
            pc--;
            paren += (
              program[pc] === "[" ? -1
              : program[pc] === "]" ? 1
              : 0
            );
          }
        }
        break;
      case "i":
        if (stdin.length) {
          memory[iqp++] = Int(stdin.codePointAt(0));
          stdin = stdin.slice(1);
        } else {
          memory[iqp++] = 0n;
        }
        break;
      case "p":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        stdout += String.fromCodePoint(Number(value));
        break;
      case "l":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(-(value < memory[oqp]));
        break;
      case "+":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value + memory[oqp]);
        break;
      case "-":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value - memory[oqp]);
        break;
      case "*":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value * memory[oqp]);
        break;
      case "/":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value / memory[oqp]);
        break;
      case "%":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value % memory[oqp]);
        break;
      case "&":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value & memory[oqp]);
        break;
      case "|":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value | memory[oqp]);
        break;
      case "^":
        var value = memory[oqp] ?? 0n;
        for (var i = oqp + 1; i < iqp; i++) {
          memory[i - 1] = memory[i] ?? 0n;
        } iqp--;
        memory[oqp] = Int(value ^ memory[oqp]);
        break;
      case "~":
        memory[oqp] = Int(-(memory[oqp] ?? 0n));
        break;
      case "!":
        memory[oqp] = Int(~(memory[oqp] ?? 0n));
        break;
    }
    pc++;
  }
}

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(stdout);
  } catch (error) {
    console.error(error.message);
  }
}

// while (pc < program.length) step();

// for (k in memory) memory[k] = BigInt.asIntN(bits, memory[k])

reset();
pressRun();
