function gimgwc() {
  window.location.href = "https://www.google.com/search?tbm=isch&q="+document.getElementById('query').value+"%20site:commons.wikimedia.org";
}

var input = document.getElementById("query");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function(event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === "Enter") {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("search").click();
  }
});