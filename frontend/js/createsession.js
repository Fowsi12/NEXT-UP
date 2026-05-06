document
    .querySelector('.createPrivate')
    .addEventListener('click', createPrivateSession);
document
    .querySelector('.createShared')
    .addEventListener('click', createSharedSession);

async function createPrivateSession() {
  const response = await fetch('/api/sessions/private', {
    method: 'POST',
  });

  if (response.ok) {
    console.log(response.status);

    const currentSession = await response.json();
    console.log(currentSession);
  }
}


async function createSharedSession() {
  const response = await fetch('/api/sessions/shared', {
    method: 'POST',
  });

  if (response.ok) {
    console.log(response.status);

    const currentSession = await response.json();
    console.log(currentSession);
  }
}