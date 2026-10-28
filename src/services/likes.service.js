const prisma = require("../db");

async function likePost(postId, userId) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found", status: 404 };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found", status: 404 };

  try {
    const like = await prisma.like.create({
      data: { userId, postId },
    });
    return { data: like, status: 201 };
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "Already liked", status: 409 };
    }
    throw e;
  }
}

async function unlikePost(postId, userId) {
  try {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
    return { status: 204 };
  } catch (e) {
    if (e.code === "P2025") {
      return { error: "Like not found", status: 404 };
    }
    throw e;
  }
}

module.exports = { likePost, unlikePost };
