function sum (iterable) {
  return iterable.reduce((a, c) => a + c, 0);
}

function count (arr, query) {
    var count = 0;
    for (i of arr) if (i == query) count++;
    return count;
}

function alphabeta (node, depth, maxing, α = -Infinity, β=Infinity) {
  if (node.isterminal) {
    return {p1: Infinity, p2: -Infinity, "draw": 0}[node.status()];
  }
  if (depth == 0) {
    return node.evaluate();
  }
  if (maxing) {
    var value = -Infinity;
    for (i in node.children) {
      value = Math.max(value, alphabeta(node.children[i], depth - 1, false, α, β));
      α = Math.max(α, value);
      if (value >= β) break;
    }
    return value;
  } else {
    var value = Infinity;
    for (i in node.children) {
      value = Math.min(value, alphabeta(node.children[i], depth - 1, true, α, β));
      β = Math.min(β, value);
      if (value <= α) break;
    }
    return value;
  }
}

const p1 = "p1";
const p2 = "p2";

class GameNode {
  constructor (width, height, board = undefined) {
    this.height = height;
    this.width = width;
    this.board = board === undefined
      ? Array.from(Array(width), x => [])
      : board;
  }
  get isterminal() {
    return [p1, p2, "draw"].includes(this.status());
  }
  get diskCount() {
    return sum(this.board.map(c => c.length));
  }
  get children() {
    var children_arr = {};
    const disk = this.diskCount % 2 ? p2 : p1
    for (var x = 0; x < this.width; x++)
    if (this.board[x].length !== this.height) {
      var new_board = [];
      for (var i = 0; i < this.width; i++) {
        new_board.push(this.board[i].concat(i === x ? [disk] : []));
      }
      children_arr[x] = new GameNode(this.width, this.height, new_board);
    }
    return children_arr;
  }
  status () {
    for (var [a, b, c] of [[0, 1, 0], [0, 0, 1], [0, 1, 1], [3, -1, 1]])
    for (var x = a; x < this.width - 3*b - a; x++) 
    for (var y = 0; y < this.height - 3*c; y++) {
      var line = [0, 1, 2, 3].map(i => this.board[x+i*b][y+i*c]);
      if (line.every(d => d === p1)) return p1;
      if (line.every(d => d === p2)) return p2;
    }
    if (this.board.every(c => c.length === this.height)) return "draw";
    return "inprogress";
  }
  evaluate () {
    var score = 0
    for (var [a, b, c] of [[0, 1, 0], [0, 0, 1], [0, 1, 1], [3, -1, 1]])
    for (var x = a; x < this.width - 3*b - a; x++) 
    for (var y = 0; y < this.height - 3*c; y++) {
      var line = [0, 1, 2, 3].map(i => this.board[x+i*b][y+i*c]);
      if (line.every(d => d === undefined)) continue;
      if (line.every(d => d !== p2)) {
        score += DIFFICULTY.scores[count(line, p1)]
      } else {
        score -= DIFFICULTY.scores[count(line, p2)]
      }
    }
    return score;
  }
}

function player_play_disk (column) {
  if (node.board[column].length < node.height && !node.isterminal) {
    node.board[column].push(node.diskCount % 2 ? p2 : p1);
    var highlight = [column, node.board[column].length-1];
    if (!node.isterminal){
      var botCol = bot_play_disk();
      highlight = [botCol, node.board[botCol].length-1];
    }
    update_screen([highlight]);
  }
}

function bot_play_disk () {
  var bestIndex;
  var bestScore = node.diskCount % 2 ? Infinity : -Infinity;
  var bot_depth = DIFFICULTY.max_depth
  while (bot_depth > DIFFICULTY.min_depth && Math.random() < DIFFICULTY.dumb_chance) {
    bot_depth -= 1;
  }
  for (childIndex in node.children) {
    var score = alphabeta(node.children[childIndex], bot_depth, node.diskCount % 2);
    console.log(childIndex, score)
    if (node.diskCount % 2 ? (score <= bestScore) : (score >= bestScore)) {
      bestIndex = childIndex;
      bestScore = score;
    }
  }
  console.log(bestIndex);
  node.board[bestIndex].push(node.diskCount % 2 ? p2 : p1);
  return bestIndex
}

function update_screen (highlights = []) {
  /*var log = "";
  for (var y = node.height - 1; y >= 0; y--) {
    for (var x = 0; x < node.width; x++)
      log += {undefined: "-", p1: "R", p2: "Y"}[node.board[x][y]]+" "
    log += "\n"
  }
  console.log(log);
  document.getElementById("screen").textContent = log;*/
  function disp(item, element_class = null) {
    if (element_class === null) {
      return ({
        undefined: "<td>-</td>",
        p1: "<td class='p1'>R</td>",
        p2: "<td class='p2'>Y</td>"
      }[item]);
    } else {
      return ({
        undefined: "<td class='"+element_class+"'>-</td>",
        p1: "<td class='p1 "+element_class+"'>R</td>",
        p2: "<td class='p2 "+element_class+"'>Y</td>"
      }[item]);
    }
  }
  var disabledtext = isdisabled ? "disabled" : "";
  var html = `
  <tr>
    <th><button ${disabledtext} onclick="player_play_disk(0)">Play</button></th>
    <th><button ${disabledtext} onclick="player_play_disk(1)">Play</button></th>
    <th><button ${disabledtext} onclick="player_play_disk(2)">Play</button></th>
    <th><button ${disabledtext} onclick="player_play_disk(3)">Play</button></th>
    <th><button ${disabledtext} onclick="player_play_disk(4)">Play</button></th>
    <th><button ${disabledtext} onclick="player_play_disk(5)">Play</button></th>
    <th><button ${disabledtext} onclick="player_play_disk(6)">Play</button></th>
  </tr>
  `;
  for (var row = node.height - 1; row >= 0; row--) {
    html += `
    <tr>
      ${disp(node.board[0][row], highlights.includes([0, row]) ? "highlight" : null)}
      ${disp(node.board[1][row], highlights.includes([1, row]) ? "highlight" : null)}
      ${disp(node.board[2][row], highlights.includes([2, row]) ? "highlight" : null)}
      ${disp(node.board[3][row], highlights.includes([3, row]) ? "highlight" : null)}
      ${disp(node.board[4][row], highlights.includes([4, row]) ? "highlight" : null)}
      ${disp(node.board[5][row], highlights.includes([5, row]) ? "highlight" : null)}
      ${disp(node.board[6][row], highlights.includes([6, row]) ? "highlight" : null)}
    </tr>`;
  }
  document.getElementById("connect-4-board").innerHTML = html;
  if (node.isterminal) {
    document.getElementById("connect-4-board").outerHTML += `
      <p id="gameover" style="font-weight: bold;">Game Over!</p>
    `;
  }
}

const diffSelect = document.getElementById("difficulty");

var node = new GameNode(7, 6);
var isdisabled = false;
var DIFFICULTY;
update_screen();

function new_game () {
  node = new GameNode(7, 6);
  isdisabled = false;
  DIFFICULTY = JSON.parse(diffSelect.value);
  document.getElementById("difficulty-label").innerHTML = `Vs. ${diffSelect.options[diffSelect.selectedIndex].text} Difficulty (as ${document.getElementById('botfirst').checked ? 'Yellow' : 'Red'})`
  if (document.getElementById("gameover") !== null) {
    document.getElementById("gameover").outerHTML = "";
  }
  var highlights = [];
  if (document.getElementById("botfirst").checked) {
    var botCol = bot_play_disk();
    highlights = [[botCol, 0]];
  }
  update_screen(highlights);
}

new_game();
