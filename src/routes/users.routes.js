const express = require("express");
const users = require("../controllers/users.controller");

const router = express.Router();

router.post("/", users.create);
router.get("/", users.list);
router.get("/:id", users.getOne);
router.patch("/:id", users.update);
router.delete("/:id", users.remove);
router.get("/:id/posts", users.listPosts);
router.get("/:id/liked-posts", users.listLikedPosts);

module.exports = router;
