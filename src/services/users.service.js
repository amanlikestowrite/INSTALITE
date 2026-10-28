const prisma = require("../db");

const ALLOWED_SORT = ["createdAt", "updatedAt", "username", "fullname"];

async function getUsers(query) {
  const { search, isPrivate, hasPosts, sortBy = "createdAt", order = "desc" } = query;

  if (isPrivate !== undefined && isPrivate !== "true" && isPrivate !== "false") {
    return { error: "isPrivate must be true or false", status: 400 };
  }

  if (hasPosts !== undefined && hasPosts !== "true" && hasPosts !== "false") {
    return { error: "hasPosts must be true or false", status: 400 };
  }

  if (!ALLOWED_SORT.includes(sortBy)) {
    return { error: "sortBy must be one of: createdAt, updatedAt, username, fullname", status: 400 };
  }

  const { page, limit, skip, error: pageError } = require("../utils/pagination").parsePagination(query);
  if (pageError) return { error: pageError, status: 400 };

  const where = {};
  if (search) {
    where.OR = [
      { username: { contains: search } },
      { fullname: { contains: search } },
    ];
  }
  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate === "true";
  }
  if (hasPosts !== undefined) {
    where.posts = hasPosts === "true" ? { some: {} } : { none: {} };
  }

  const orderDir = order === "asc" ? "asc" : "desc";

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: orderDir },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { posts: true, likes: true } },
    },
  });

  if (!user) return null;
  return user;
}

async function createUser(data) {
  const { username, email, fullname, bio, isPrivate } = data;
  return prisma.user.create({
    data: { username, email, fullname, bio, isPrivate },
  });
}

async function updateUser(id, data) {
  const { username, email, fullname, bio, isPrivate } = data;
  return prisma.user.update({
    where: { id },
    data: { username, email, fullname, bio, isPrivate },
  });
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

async function getUserPosts(userId, query) {
  const { page, limit, skip, error: pageError } = require("../utils/pagination").parsePagination(query);
  if (pageError) return { error: pageError, status: 400 };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found", status: 404 };

  const where = { authorId: userId };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
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

async function getUserLikedPosts(userId, query) {
  const { page, limit, skip, error: pageError } = require("../utils/pagination").parsePagination(query);
  if (pageError) return { error: pageError, status: 400 };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found", status: 404 };

  const where = { likes: { some: { userId } } };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getUserPosts, getUserLikedPosts };
