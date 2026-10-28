const postsService = require("../services/posts.service");

async function listPosts(req, res) {
  const result = await postsService.getPosts(req.query);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.json(result);
}

async function getPost(req, res) {
  const id = Number(req.params.id);
  const post = await postsService.getPostById(id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  return res.json(post);
}

async function createPost(req, res) {
  const { imageUrl, caption, location, authorId } = req.body;

  if (!imageUrl || !authorId) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  const authorIdNum = Number(authorId);
  if (!Number.isInteger(authorIdNum)) {
    return res.status(400).json({ error: "imageUrl and authorId are required" });
  }

  try {
    const post = await postsService.createPost({ imageUrl, caption, location, authorId: authorIdNum });
    return res.status(201).json(post);
  } catch (e) {
    if (e.code === "P2003" || e.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    throw e;
  }
}

async function updatePost(req, res) {
  const id = Number(req.params.id);
  try {
    const post = await postsService.updatePost(id, req.body);
    return res.json(post);
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Post not found" });
    throw e;
  }
}

async function deletePost(req, res) {
  const id = Number(req.params.id);
  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Post not found" });
    throw e;
  }
}

async function getPostLikes(req, res) {
  const id = Number(req.params.id);
  const result = await postsService.getPostLikes(id);
  if (result === null) return res.status(404).json({ error: "Post not found" });
  return res.json(result);
}

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, getPostLikes };
