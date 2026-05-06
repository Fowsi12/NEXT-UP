/* ERROR BOX SHOW OG FADE UD: 
Den tager message som parameter
message vises som text i boxen */
let errorTimeout; 
/* errorTimeout: 
vi bruger den til at clear timeout tiden på fadeout 
I tilfælde af, at brugeren spammer knappen der viser error boxen */
export function showError(message) {
  const errorBox = document.getElementById("errorBox");

  clearTimeout(errorTimeout);
/* clearTimeout:
nulstiller errorTimeout funktionen hver gang showError funktionen kaldes */

  errorBox.textContent = message;
  errorBox.style.display = "block";

  setTimeout(function() {
    errorBox.style.opacity = "1"; //fade ind
  }, 10);

  errorTimeout = setTimeout(function() {
    errorBox.style.opacity = "0"; // fade out
    setTimeout(function() {
      errorBox.style.display = "none"; //skjuler boxen helt igen
    }, 500);
  }, 3000);
}