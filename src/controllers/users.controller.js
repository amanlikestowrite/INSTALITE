const usersService = require("../services/users.service");

async function listUsers(req, res) {
  const result = await usersService.getUsers(req.query);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.json(result);
}

async function getUser(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

  const user = await usersService.getUserById(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
}

async function createUser(req, res) {
  const { username, email, fullname, bio, isPrivate } = req.body;
  if (!username || !email || !fullname) {
    return res.status(400).json({ error: "username, email and fullname are required" });
  }
  try {
    const user = await usersService.createUser({ username, email, fullname, bio, isPrivate });
    return res.status(201).json(user);
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    throw e;
  }
}

async function updateUser(req, res) {
  const id = Number(req.params.id);
  try {
    const user = await usersService.updateUser(id, req.body);
    return res.json(user);
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "User not found" });
    throw e;
  }
}

async function deleteUser(req, res) {
  const id = Number(req.params.id);
  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "User not found" });
    throw e;
  }
}

async function getUserPosts(req, res) {
  const id = Number(req.params.id);
  const result = await usersService.getUserPosts(id, req.query);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.json(result);
}

async function getUserLikedPosts(req, res) {
  const id = Number(req.params.id);
  const result = await usersService.getUserLikedPosts(id, req.query);
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.json(result);
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, getUserPosts, getUserLikedPosts };
