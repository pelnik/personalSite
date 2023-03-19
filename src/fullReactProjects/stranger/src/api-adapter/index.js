const BASE_URL = "https://strangers-things.herokuapp.com/api/2301-ftb-et-web-ft";

export const getPosts = async (token) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (token !== null) {
      headers.Authorization = `Bearer ${token}`;
    }
    

    const response = await fetch(BASE_URL + '/posts', {
      method: 'GET',
      headers: headers,
    })
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}

export const register = async (user) => {
  try {
    const response = await fetch(BASE_URL + '/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  
      },
      body: JSON.stringify({
        user: {
          username: user.username,
          password: user.password,
        }
      })
    })
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}

export const login = async (user) => {
  try {
    const response = await fetch(BASE_URL + '/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'  
      },
      body: JSON.stringify({
        user: {
          username: user.username,
          password: user.password,
        }
      })
    })
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}

export const postSubmission = async (postDetails, token) => {
  try {
    const response = await fetch(BASE_URL + '/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        post: postDetails
      })
    })
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}

export const deleteSubmission = async (id, token) => {
  try {
    const response = await fetch(BASE_URL + `/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}

export const getMyData = async (token) => {
  try {
    const response = await fetch(BASE_URL + `/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json();

    return result;
  } catch (error) {
    console.error(error);
  }
}


export const postMessages = async (token, post_id, content) => {
  try {
    const response = await fetch(BASE_URL + `/posts/${post_id}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: {
          content: content
        }
      })
    })
    const result = await response.json();

 
    return result;
  } catch (error) {
    console.error(error);
  }
}