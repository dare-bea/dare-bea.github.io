function sum (iterable) {
  return iterable.reduce((a, c) => a + c, 0);
}

function count (arr, query) {
    var count = 0;
    for (i of arr) if (i == query) count++;
    return count;
}

function alphabeta (node, depth, maxing, α = -Infinity, β=Infinity) {
  if (depth == 0 || node.isterminal) {
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
    const scores = [0, 1, 4, 10, Infinity]
    var score = 0
    for (var [a, b, c] of [[0, 1, 0], [0, 0, 1], [0, 1, 1], [3, -1, 1]])
    for (var x = a; x < this.width - 3*b - a; x++) 
    for (var y = 0; y < this.height - 3*c; y++) {
      var line = [0, 1, 2, 3].map(i => this.board[x+i*b][y+i*c]);
      if (line.every(d => d === undefined)) continue;
      if (line.every(d => d !== p2)) {
        score += scores[count(line, p1)]
      } else {
        score -= scores[count(line, p2)]
      }
    }
    return score;
  }
}

function player_play_disk (column) {
  if (node.board[column].length < node.height && !node.isterminal) {
    node.board[column].push(node.diskCount % 2 ? p2 : p1);
    bot_play_disk();
    update_screen();
  }
}

function bot_play_disk () {
  var bestIndex;
  var bestScore = node.diskCount % 2 ? Infinity : -Infinity;
  for (childIndex in node.children) {
    var score = alphabeta(node.children[childIndex], BOT_DEPTH, node.diskCount % 2);
    console.log(childIndex, score)
    if (node.diskCount % 2 ? (score < bestScore) : (score > bestScore)) {
      bestIndex = childIndex;
      bestScore = score;
    }
  }
  console.log(bestIndex);
  node.board[bestIndex].push(node.diskCount % 2 ? p2 : p1);
}

function update_screen () {
  /*var log = "";
  for (var y = node.height - 1; y >= 0; y--) {
    for (var x = 0; x < node.width; x++)
      log += {undefined: "-", p1: "R", p2: "Y"}[node.board[x][y]]+" "
    log += "\n"
  }
  console.log(log);
  document.getElementById("screen").textContent = log;*/
  const disp = {
    undefined: "<td>-</td>",
    p1: "<td class='p1'>R</td>",
    p2: "<td class='p2'>Y</td>"
  };
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
      ${disp[node.board[0][row]]}
      ${disp[node.board[1][row]]}
      ${disp[node.board[2][row]]}
      ${disp[node.board[3][row]]}
      ${disp[node.board[4][row]]}
      ${disp[node.board[5][row]]}
      ${disp[node.board[6][row]]}
    </tr>`;
  }
  document.getElementById("connect-4-board").innerHTML = html;
  if (node.isterminal) {
    document.getElementById("connect-4-board").outerHTML += `
      <p id="gameover" style="font-weight: bold;">Game Over!</p>
    `;
  }
}

const BOT_DEPTH = 5;

var isdisabled = false;
node = new GameNode(7, 6)
update_screen();

function new_game () {
  node = new GameNode(7, 6);
  isdisabled = false;
  if (document.getElementById("gameover") !== null) {
    document.getElementById("gameover").outerHTML = "";
  }
  if (document.getElementById("botfirst").checked) {
    bot_play_disk();
  }
  update_screen();
}