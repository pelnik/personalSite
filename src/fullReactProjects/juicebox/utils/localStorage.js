export function saveToLocalStorage(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  let fetchedToken = localStorage.getItem('token');
  if (fetchedToken === null) {
    fetchedToken = '';
  }

  return fetchedToken;
}