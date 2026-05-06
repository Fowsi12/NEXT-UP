/* JOIN SESSION
Denne fil styrer join-session siden.
Den læser session_id fra inputfeltet, sender det til backend,
og sender brugeren videre til mainpage.html hvis sessionen findes.
*/

const joinButton = document.getElementById("joinSessionButton");
const sessionInput = document.getElementById("joinSession");
const message = document.getElementById("joinSessionMessage");

joinButton.addEventListener("click", joinSession);

async function joinSession() {
  const sessionId = sessionInput.value.trim();

  if (!sessionId) {
    message.textContent = "Skriv et session ID.";
    return;
  }

  try {
    
    const response = await fetch("/api/sessions/join", { // Sender det indtastede session_id til backend, så serveren kan tjekke databasen.
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const result = await response.json();

    if (!response.ok) {
      message.textContent = result.message || "Kunne ikke joine session.";
      return;
    }

/*
localStorage er et JavaScript Web API, der gør det muligt at gemme data lokalt i brugerens browser. 
Data bevares, selv efter browseren lukkes eller genstartes, og gemmes uden udløbsdato. 
Det bruges ofte til at huske brugerpræferencer (som "dark mode"), indkøbskurve eller "huske mig"-funktioner
*/
    localStorage.setItem("session_id", result.session.session_id);
    localStorage.setItem("is_private", result.session.is_private);
// Gemmer session_id i browseren, så andre sider kan vide hvilken session brugeren er i.



    console.log("Joined session:", result.session);

// Hvis join lykkes, sendes brugeren videre til hovedsiden "mainpage.html".
    window.location.href = "mainpage.html";
  } catch (error) {
    console.error(error);
    message.textContent = "Der skete en fejl ved join session.";
  }
}