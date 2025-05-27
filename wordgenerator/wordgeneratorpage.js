const wordsOutput = document.getElementById("wordsOutput");
const outputDetails = document.getElementById("outputDetails");

function toJSON () {
  return JSON.stringify({
    categories,
    wordCount,
    optionalWeight,
    wordFilters: wordFilters.map(([regexp, replacement]) => [regexp.source, replacement]),
    pattern
  });
}

function fromJSON (json) {
  let data = JSON.parse(json);
  categories = data.categories;
  wordCount = data.wordCount;
  optionalWeight = data.optionalWeight;
  wordFilters = data.wordFilters.map(([regexp, replacement]) => [new RegExp(regexp, "g"), replacement]);
  pattern = data.pattern;
}

function download(data, filename) {
  var file = new Blob([data], {type: "application/json"});
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
      fromJSON(evt.target.result);
    };
    reader.readAsText(file);
  }
}

document.getElementById("clearAllButton")
.addEventListener('click', () => {
  categories.length = 0;
  categories.push(["C", ""], ["V", ""]);
  wordFilters.length = 0;
  pattern = "";
  updateScreen();
});

document.getElementById("addCategoryButton")
.addEventListener('click', () => {
  categories.push(["", ""]);
  updateScreen();
});

document.getElementById("addFilterButton")
.addEventListener('click', () => {
  wordFilters.push([new RegExp("^(?:)$", "g"), ""]);
  updateScreen();
});

document.getElementById("patternInput")
.addEventListener('input', (e) => {
  pattern = e.target.value;
});


document.getElementById("wordCount")
.addEventListener('input', (e) => {
  wordCount = e.target.value;
});

document.getElementById("optionalWeight")
.addEventListener('input', (e) => {
  optionalWeight = e.target.value;
});

document.getElementById("generateWords")
.addEventListener('click', () => {
  let words;
  if (wordCount == 0) {
    words = generateAllWords(pattern, categories, wordFilters);
  } else {
    words = generateWords(pattern, categories, wordFilters,
                          wordCount, optionalWeight);
  }
  wordsOutput.innerText = words.join(" ");
  outputDetails.innerText =
    (words.length === 0)
    ? `No words generated.`
    : (words.length === 1)
    ? `Generated 1 word!`
    : `Generated ${words.length} words!`;
  if (wordCount > words.length) {
    outputDetails.innerText += ` (${wordCount-words.length} rejected)`;
  }
});

function updateScreen() {
  const patternInput = document.getElementById("patternInput");
  patternInput.value = pattern;
  const wordCountInput = document.getElementById("wordCount").value = wordCount;
  const optionalWeightInput = document.getElementById("optionalWeight").value = optionalWeight;
  
  const filTable = document.getElementById("filters");
  
  // clear out any old rows
  while (filTable.firstChild) {
    filTable.removeChild(filTable.firstChild);
  }

  // rebuild the table
  wordFilters.forEach(([fil, rep], idx) => {
    // create row and cells
    const tr = document.createElement("tr");

    // --- pattern input ---
    const tdRegex = document.createElement("td");
    const regexInput = document.createElement("input");
    regexInput.type = "text";
    regexInput.classList.add("filterRegexInput");
    regexInput.value = fil.source; // DOM handles all escaping
    regexInput.addEventListener('input', (e) => {
      wordFilters[idx][0] = new RegExp(e.target.value, "g");
    });
    tdRegex.appendChild(regexInput);
    tr.appendChild(tdRegex);

    // --- pattern input ---
    const tdReplace = document.createElement("td");
    const replaceInput = document.createElement("input");
    replaceInput.type = "text";
    replaceInput.classList.add("filterReplaceInput");
    replaceInput.value = rep; // DOM handles all escaping
    replaceInput.addEventListener('input', (e) => {
      wordFilters[idx][1] = e.target.value;
    });
    tdReplace.appendChild(replaceInput);
    tr.appendChild(tdReplace);

    // --- up button ---
    const tdUp = document.createElement("td");
    const btnUp = document.createElement("button");
    btnUp.type = "button";
    btnUp.classList.add("moveButton");
    btnUp.textContent = "\u2191";
    btnUp.addEventListener('click', (e) => {
      wordFilters.splice(idx-1, 0, ...wordFilters.splice(idx, 1));
      updateScreen();
    });
    tdUp.appendChild(btnUp);
    tr.appendChild(tdUp);

    // --- down button ---
    const tdDown = document.createElement("td");
    const btnDown = document.createElement("button");
    btnDown.type = "button";
    btnDown.classList.add("moveButton");
    btnDown.textContent = "\u2193";
    btnDown.addEventListener('click', (e) => {
      wordFilters.splice(idx+1, 0, ...wordFilters.splice(idx, 1));
      updateScreen();
    });
    tdDown.appendChild(btnDown);
    tr.appendChild(tdDown);

    // --- remove button ---
    const tdRemove = document.createElement("td");
    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.classList.add("removeButton");
    btnRemove.textContent = "X";
    btnRemove.addEventListener('click', (e) => {
      wordFilters.splice(idx, 1);
      updateScreen();
    });
    tdRemove.appendChild(btnRemove);
    tr.appendChild(tdRemove);

    filTable.appendChild(tr);
  });
  
  const catTable = document.getElementById("categories");
  
  // clear out any old rows
  while (catTable.firstChild) {
    catTable.removeChild(catTable.firstChild);
  }

  // rebuild the table
  categories.forEach(([cat, pat], idx) => {
    // create row and cells
    const tr = document.createElement("tr");

    // --- category select ---
    const tdSelect = document.createElement("td");
    const select = document.createElement("select");
    select.classList.add("categoryNameInput");

    // A–Z options
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(letter => {
      const option = document.createElement("option");
      option.value = letter;
      option.textContent = letter;
      if (letter === cat) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    select.addEventListener('input', (e) => {
      categories[idx][0] = e.target.value;
    });
    tdSelect.appendChild(select);
    tr.appendChild(tdSelect);

    // --- pattern input ---
    const tdPattern = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.size = 50;
    input.classList.add("categoryPatternInput");
    input.value = pat; // DOM handles all escaping
    input.addEventListener('input', (e) => {
      categories[idx][1] = e.target.value;
    });
    tdPattern.appendChild(input);
    tr.appendChild(tdPattern);

    // --- remove button ---
    const tdRemove = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("removeButton");
    btn.textContent = "X";
    btn.addEventListener('click', (e) => {
      categories.splice(idx, 1);
      updateScreen();
    });
    tdRemove.appendChild(btn);
    tr.appendChild(tdRemove);

    catTable.appendChild(tr);
  });
}

updateScreen();
