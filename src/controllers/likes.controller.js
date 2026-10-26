const likesService = require("../services/likes.service");
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");
const { parseId } = require("../utils/ids");

async function like(req, res) {
  try {
    const { userId } = req.body;


    if (userId === undefined || userId === null) {
      return res.status(400).json({ error: "userId is required" });
    }

    const postId = parseId(req.params.id);
    if (postId === null || !(await postsService.postExists(postId))) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!Number.isInteger(userId) || !(await usersService.userExists(userId))) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await likesService.likePost(userId, postId);
    res.status(201).json(result);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function unlike(req, res) {
  try {
    const postId = parseId(req.params.id);
    const userId = parseId(req.params.userId);
    if (postId === null || userId === null) {
      return res.status(404).json({ error: "Like not found" });
    }

    await likesService.unlikePost(userId, postId);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { like, unlike };
