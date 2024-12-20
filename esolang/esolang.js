function mod (a, b) {
  return ((a % b) + b) % b;
};

var FILE = "";
var STDIN = "";
var STDOUT = "";

FILE = `(intPrint: bsc1-B1[d10%s10/d]xcb-[48+pcb-]B)
(print: cb-[1~rpcb-]B)
99,1[
d{intPrint}bcB" bottle"1~rd1=!["s"]1r" of beer on the wall, "{print}
d{intPrint}bcB" bottle"1~rd1=!["s"]1r" of beer.\nTake one down, pass it around, "{print}
1-d{intPrint}bcB" bottle"1~rd1=!["s"]1r" of beer on the wall.\n"{print}d1>]x`;
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
var i;

function run() {
  STDOUT = "";
  try {
    for (i = 0; i < FILE.length;) {
      step();
    }
  } catch (e) {console.error(e);}
  document.getElementById('stdout').textContent = STDOUT;
}

function reset () {
  i = 0;
  STDOUT = "";
  document.getElementById('stdout').textContent = STDOUT;
}

/*
console.log('OUTPUT:\n'+STDOUT);
console.log('BSP: '+bsp, 'SP: '+sp, 'IP: '+i)
for (var i = bsp; i < sp; i++) {
  console.log(i+": "+stack[i])
}
*/

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
          if (FILE[i+1] !== '\n') {
            stack[sp++] = escapeSequences[FILE[++i]]
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
