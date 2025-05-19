document.getElementById("addCategoryButton")
.addEventListener('click', (e) => {
  categories.push(["", ""]);
  updateScreen();
});

document.getElementById("patternInput")
.addEventListener('input', (e) => {
  pattern = e.target.value;
});

function updateScreen() {
  const patternInput = document.getElementById("patternInput");
  patternInput.value = pattern;
  
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
    btn.classList.add("categoryRemoveButton");
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
