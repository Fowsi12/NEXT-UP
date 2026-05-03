/* OPEN MOOD BOXES */
const moodBoxes = document.querySelectorAll(".moodBox");
const openMoodBoxButtons = document.querySelectorAll(".openMoodBox");
/* .querySelectorAll:
finder alle elementer med class="closeMoodBox"
og returnerer en NodeList (liste med elementer) */
openMoodBoxButtons.forEach(function(button) {
/* forEach: 
følgende gøres for hvert element i NodeList'en*/
    button.addEventListener("click", function() {
        
        moodBoxes.forEach(function(box) {
            box.style.display = "none";
            box.style.opacity = "0";
            box.style.pointerEvents = "none";
        });
/*moodBoxes.forEach:
Lukker evt. åbne Moodboxes, hvis man klipper på en anden*/

        const targetBox = button.dataset.target;
/* button.dataset.target:
const targetBox oprettes fra attributten "data-target" fra html 
I html har hver knap sit eget data-target, så de kan pege på forskellige classes*/
        const box = document.getElementById(targetBox);
/* const box: 
Det er den box, som vi vil ændre på (åbne).
Den rammer vi vha. getElementById(targetBox). 
I stedet for (targetBox), kunne vi have skrevet en class på en box, 
men vi har 6 boxe, som skal åbnes med hver deres knap... 
På denne måde kan vi ramme alle 6 med én funktion*/
        box.style.display = "block";

        setTimeout(function () {
            box.style.opacity = "1";
            box.style.pointerEvents = "auto";
        }, 200);
    });
});


/* CLOSE MOOD BOXES */
const closeMoodBoxButtons = document.querySelectorAll(".closeMoodBox"); 
/* .querySelectorAll:
finder alle elementer med class="closeMoodBox"
og returnerer en NodeList (liste med elementer) */
closeMoodBoxButtons.forEach(function(button) {
    button.addEventListener("click", closeMoodBox);
});
/* .forEach: 
aktiverer funktionen closeMoodBoxes for hvert DOM element i NodeList'en
.addEventListener tilføjer en EventListener("click") til elementerne
*/
function closeMoodBox(event) {
    const moodBox = event.target.closest(".moodBox");
/* event.target.closest: 
event.target er det element man klikker på.
.closest finder den tætteste indsatte parameter (her classen moodBox).
Tætteste=den går opad i DOM-træet: 
Først tjekkes elementet selv, så parent og så parent's parent osv.
Derfor finder den den moodBox, som knappen er i og udfører nedenstående*/
    setTimeout(function() {
        moodBox.style.opacity = "0";
        box.style.pointerEvents = "none"
    }, 200);
/* setTimeout: 
venter x milliseconds, 
inden popup menuen skifter til opacity=0 (bliver gennemsigtig),
så man kan se knappen reagere*/
    setTimeout(function() {
        moodBox.style.display = "none";
    }, 500);
/* setTimeout: 
venter 500 ms inden boxen bliver helt skjult igen, 
fordi den har style="transition: opacity 0.5s"*/
}

