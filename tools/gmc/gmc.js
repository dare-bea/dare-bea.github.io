const input = document.getElementById("query");

input.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById("search").click();
  }
});

const QUERY_APPEND = "(site:wikipedia.org OR site:commons.wikimedia.org)";

function gimgwc() {
  window.location.href = "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(document.getElementById('query').value + " " + QUERY_APPEND);
}
