function mod (a, b) {
  return ((a % b) + b) % b;
};

var FILE = "";
var STDIN = "";
var STDOUT = "";

FILE = ``;
STDIN = ``;

const escape_sequences = {
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

var stack = {};
var calls = [];
var functions = {};
var bsp = 0;
var sp = 0;
var i = 0;

var repeatID;

function run() {
  // reset();
  if (repeatID !== undefined) {
    clearInterval(repeatID);
    repeatID = undefined;
  }
  document.getElementById('stdout').value = "Running...";
  if (document.getElementById('speed').value > 0) {
    function nextStep () {
      if (i < FILE.length && !(STDIN.length === 0 && FILE[i] === 'i')) {
        doStep();
      } else {
        clearInterval(repeatID);
        repeatID = undefined;
      }
    }
    repeatID = setInterval(nextStep, document.getElementById('speed').value);
  } else {
    while (i < FILE.length && !(STDIN.length === 0 && FILE[i] === 'i')) {
      step();
    }
  document.getElementById('stdin').value = STDIN;
  document.getElementById('stdout').value = STDOUT;
  document.getElementById('status').textContent = `BSP: ${bsp}  SP: ${sp}  IP: ${i}`;
  var stackl1 = ""
  var stackl2 = ""
  for (var j = bsp; j < sp; j++) {
    stackl1 += stack[j]+" "
    stackl2 += String.fromCharCode(stack[j])
    for (var _ = 0; _ < (stack[j].toString().length)-String.fromCharCode(stack[j]).length; _++) {
      stackl2 += " "
    }
    stackl2 += " "
  }
  document.getElementById('stack').value = stackl1 + "\n" + stackl2;
  }
}

function reset () {
  stack = {};
  calls = [];
  functions = {};
  bsp = 0; sp = 0; i = 0;
  FILE = document.getElementById('file').value;
  STDIN = document.getElementById('stdin').value;
  STDOUT = "";
  document.getElementById('stdout').value = STDOUT;
  document.getElementById('status').textContent = `BSP: ${bsp}  SP: ${sp}  IP: ${i}`;
  document.getElementById('stack').value = "";
}

/*
console.log('OUTPUT:\n'+STDOUT);
console.log('BSP: '+bsp, 'SP: '+sp, 'IP: '+i)
for (var i = bsp; i < sp; i++) {
  console.log(i+": "+stack[i])
}
*/

function doStep() {
  STDIN = document.getElementById('stdin').value;
  if (i < FILE.length) {
    step();
  }
  document.getElementById('stdin').value = STDIN;
  document.getElementById('stdout').value = STDOUT;
  document.getElementById('status').textContent = `BSP: ${bsp}  SP: ${sp}  IP: ${i}`;
  var stackl1 = ""
  var stackl2 = ""
  for (var j = bsp; j < sp; j++) {
    stackl1 += stack[j]+" "
    stackl2 += String.fromCharCode(stack[j])
    for (var _ = 0; _ < (stack[j].toString().length)-String.fromCharCode(stack[j]).length; _++) {
      stackl2 += " "
    }
    stackl2 += " "
  }
  document.getElementById('stack').value = stackl1 + "\n" + stackl2;
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
      [stack[sp-2], stack[sp-1]] = [stack[sp-1], stack[sp-2]]
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
      stack[sp] = stack[sp-1];
      sp++;
      break;
    case '+':
      sp--; stack[sp-1] = stack[sp-1] + stack[sp]; break;
    case '-':
      sp--; stack[sp-1] = stack[sp-1] - stack[sp]; break;
    case '*':
      sp--; stack[sp-1] = stack[sp-1] * stack[sp]; break;
    case '/':
      sp--; stack[sp-1] = Math.floor(stack[sp-1] / stack[sp]); break;
    case '^':
      sp--; stack[sp-1] = stack[sp-1] ** stack[sp]; break;
    case '%':
      sp--; stack[sp-1] = mod(stack[sp-1], stack[sp]); break;
    case '&':
      sp--; stack[sp-1] = stack[sp-1] & stack[sp]; break;
    case '|':
      sp--; stack[sp-1] = stack[sp-1] | stack[sp]; break;
    case '\'':
      sp--; stack[sp-1] = stack[sp-1] ^ stack[sp]; break;
    case '~':
      stack[sp-1] = -stack[sp-1]; break;
    case '!':
      stack[sp-1] = ~stack[sp-1]; break;
    case '=':
      sp--; stack[sp-1] = stack[sp-1] === stack[sp] ? -1 : 0; break;
    case '>':
      sp--; stack[sp-1] = stack[sp-1] > stack[sp] ? -1 : 0; break;
    case '<':
      sp--; stack[sp-1] = stack[sp-1] < stack[sp] ? -1 : 0; break;
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
      stack[sp] = sp; sp++; break;
    case 'b':
      stack[sp++] = bsp; break;
    case 'C':
      sp = stack[sp - 1]; break;
    case 'B':
      bsp = stack[--sp]; break;
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
  }
  i++;
}

reset();
