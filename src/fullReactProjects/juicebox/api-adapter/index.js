import { saveToLocalStorage } from '../utils/localStorage';

const BASE_URL = 'https://pelnik.dev/api/juicebox';

export async function login(username, password) {
  try {
    let token = null;

    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const fullResponse = await response.json();

    if ('token' in fullResponse) {
      token = fullResponse.token;
      saveToLocalStorage(token);
    }

    return token;
  } catch (error) {
    console.error(error);
  }
}

export async function getPosts(token) {
  const headerObject = {
    'Content-Type': 'application/json',
  };

  if (token !== '') {
    headerObject.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'GET',
      headers: headerObject,
    });

    const fullResponse = await response.json();

    const posts = fullResponse.posts;

    return posts;
  } catch (error) {
    console.error(error);
  }
}

export async function register(user) {
  try {
    let token = null;

    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user.username,
        password: user.password,
        name: user.name,
        location: user.location,
      }),
    });
    const fullResponse = await response.json();

    if ('token' in fullResponse) {
      token = fullResponse.token;
      saveToLocalStorage(token);
    }

    return fullResponse;
  } catch (error) {
    console.error(error);
  }
}

export async function newPost(userToken, title, content, tags = '') {
  try {
    const response = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });
    const fullResponse = await response.json();

    return fullResponse.post;
  } catch (error) {
    console.error(error);
  }
}

export async function patchPost(userToken, postId, title, content, tags) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });
    const fullResponse = await response.json();

    return fullResponse.post;
  } catch (error) {
    console.error(error);
  }
}

export async function deletePost(userToken, postId) {
  try {
    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });
    const fullResponse = await response.json();

    return fullResponse.post;
  } catch (error) {
    console.error(error);
  }
}
