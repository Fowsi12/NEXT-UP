/* API KODE */

/* SESSION + VOTES
Denne fil holder styr på hvilken session brugeren er i.
Den gemmer også brugerens valgte sange pr. session,
så sangene kan vises på myvotes.html uden at miste sessionen.
*/

function saveCurrentSession(session) {
  localStorage.setItem("session_id", session.session_id);
  localStorage.setItem("is_private", session.is_private);
}

function getCurrentSessionId() {
  return localStorage.getItem("session_id");
}

function requireCurrentSession() {
  const sessionId = getCurrentSessionId();

  if (!sessionId) {
    window.location.href = "index.html";
    return null;
  }

  return sessionId;
}

function getVotesStorageKey() {
  const sessionId = getCurrentSessionId();
  return `myVotes_session_${sessionId}`;
}

function getSessionVotes() {
  const votesKey = getVotesStorageKey();
  return JSON.parse(localStorage.getItem(votesKey)) || [];
}

function saveSessionVotes(votes) {
  const votesKey = getVotesStorageKey();
  localStorage.setItem(votesKey, JSON.stringify(votes));
}

function addTrackToSessionVotes(track) {
  const votes = getSessionVotes();

  const alreadyChosen = votes.some((vote) => {
    return vote.track_id === track.track_id;
  });

  if (alreadyChosen) {
    return;
  }

  votes.push(track);
  saveSessionVotes(votes);
}

function removeTrackFromSessionVotes(trackId) {
  let votes = getSessionVotes();

  votes = votes.filter((track) => {
    return track.track_id !== trackId;
  });

  saveSessionVotes(votes);
}