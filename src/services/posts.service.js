const prisma = require("../db");
const { parsePagination } = require("../utils/pagination");

const ALLOWED_SORT = ["createdAt", "updatedAt", "likes"];

async function getPosts(query) {
  const { search, location, isPrivate, sortBy = "createdAt", order = "desc" } = query;

  if (!ALLOWED_SORT.includes(sortBy)) {
    return { error: "sortBy must be one of: createdAt, updatedAt, likes", status: 400 };
  }

  const { page, limit, skip, error: pageError } = parsePagination(query);
  if (pageError) return { error: pageError, status: 400 };

  const where = {};
  if (search) {
    where.OR = [
      { caption:  { contains: search } },
      { location: { contains: search } },
    ];
  }
  if (location) {
    where.location = { contains: location };
  }
  if (isPrivate !== undefined) {
    if (isPrivate !== "true" && isPrivate !== "false") {
      return { error: "isPrivate must be true or false", status: 400 };
    }
    where.author = { isPrivate: isPrivate === "true" };
  }

  let orderBy;
  const orderDir = order === "asc" ? "asc" : "desc";

  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: orderDir } },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = { [sortBy]: orderDir };
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, username: true, fullname: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getPostById(id) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } },
    },
  });
  return post;
}

async function createPost(data) {
  const { imageUrl, caption, location, authorId } = data;
  return prisma.post.create({
    data: { imageUrl, caption, location, authorId },
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } },
    },
  });
}

async function updatePost(id, data) {
  const { imageUrl, caption, location } = data;
  return prisma.post.update({
    where: { id },
    data: { imageUrl, caption, location },
    include: {
      author: { select: { id: true, username: true, fullname: true } },
      _count: { select: { likes: true } },
    },
  });
}

async function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

async function getPostLikes(postId) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;

  const users = await prisma.user.findMany({
    where: { likes: { some: { postId } } },
    select: { id: true, username: true, fullname: true },
    orderBy: { username: "asc" },
  });

  return users;
}

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost, getPostLikes };
