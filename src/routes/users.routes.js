const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

router.get("/",           usersController.listUsers);
router.post("/",          usersController.createUser);
router.get("/:id",        usersController.getUser);
router.patch("/:id",      usersController.updateUser);
router.delete("/:id",     usersController.deleteUser);
router.get("/:id/posts",  usersController.getUserPosts);
router.get("/:id/liked-posts", usersController.getUserLikedPosts);

module.exports = router;
