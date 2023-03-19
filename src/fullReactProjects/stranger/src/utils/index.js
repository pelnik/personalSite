export function checkLocalStorageToken() {
  const token = localStorage.getItem('userToken');
  
  return token === undefined ? null : token;
}


export function writeLocalStorageToken(token) {
  localStorage.setItem('userToken', token);
  
  return token;
}

export function removeLocalStorageToken() {
  localStorage.removeItem('userToken');
}