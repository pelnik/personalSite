// Same-origin: Express serves the API in production, and Vite proxies /api
// to Express in development.
const BASE_URL = '/api/juicebox';

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
