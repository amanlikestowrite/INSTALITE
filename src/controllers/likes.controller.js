const likesService = require("../services/likes.service");

async function likePost(req, res) {
  const postId = Number(req.params.id);
  const { userId } = req.body;

  if (userId === undefined || userId === null || userId === "") {
    return res.status(400).json({ error: "userId is required" });
  }

  const userIdNum = Number(userId);

  const result = await likesService.likePost(postId, userIdNum);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(result.status).json(result.data);
}

async function unlikePost(req, res) {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  const result = await likesService.unlikePost(postId, userId);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(204).send();
}

module.exports = { likePost, unlikePost };
