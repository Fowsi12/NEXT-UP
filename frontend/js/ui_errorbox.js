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

  errorBox.innerHTML = message;
  errorBox.style.display = "block";

  setTimeout(function() {
    errorBox.style.opacity = "1"; //fade ind
  }, 10);

  errorTimeout = setTimeout(function() {
    errorBox.style.opacity = "0"; // fade out
    setTimeout(function() {
      errorBox.style.display = "none"; //skjuler boxen helt igen
    }, 500);
  }, 4000); //hvor mange ms skal error boksen være synlig
}

/* MESSAGE BOX SHOW OG FADE UD: 
Den tager message som parameter
message vises som text i boxen */

let messageTimeout; 
export function showMessage(message) {
  const messageBox = document.getElementById("messageBox");

  clearTimeout(messageTimeout);
/* clearTimeout:
nulstiller errorTimeout funktionen hver gang showError funktionen kaldes */

  messageBox.innerHTML = message;
  messageBox.style.display = "block";

  setTimeout(function() {
    messageBox.style.opacity = "1"; //fade ind
  }, 10);

  messageTimeout = setTimeout(function() {
    messageBox.style.opacity = "0"; // fade out
    setTimeout(function() {
      messageBox.style.display = "none"; //skjuler boxen helt igen
    }, 500);
  }, 4000); //hvor mange ms skal error boksen være synlig
}