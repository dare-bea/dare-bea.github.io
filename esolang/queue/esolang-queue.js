var stdin = "";
var program = //"1[idd[p0r]]";
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

var lastStepType;

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
  document.getElementById('status').value = "Run pressed!";
  if (program !== document.getElementById('program').value || i >= FILE.length) {
    reset();
  }
  if (repeatId !== undefined) {
    clearTimeout(repeatId);
    repeatId = undefined;
  }
  stdin = document.getElementById('stdin').value;
  function nextStep() {
    if (pc < program.length) {
      pressStep();
      repeatId = setTimeout(nextStep, 0);
    } else {
      repeatId = undefined;
    }
  }
  console.log(memory, iqp, oqp);
  console.log(stdin);
  console.log(stdout);
}

function pressStep() {
  stdin = document.getElementById('stdin').value;
  if (i < FILE.length) {
    step();
  }
  document.getElementById('stdin').value = stdin;
  document.getElementById('stdout').value = stdout;
}

function reset () {
  stdout = "";
  pc = 0;
  iqp = 0;
  oqp = 0;
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

// while (pc < program.length) step();

// for (k in memory) memory[k] = BigInt.asIntN(bits, memory[k])

pressRun();
