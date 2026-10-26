const express = require("express");
const posts = require("../controllers/posts.controller");
const likes = require("../controllers/likes.controller");

const router = express.Router();

router.post("/", posts.create);
router.get("/", posts.list);
router.get("/:id", posts.getOne);
router.patch("/:id", posts.update);
router.delete("/:id", posts.remove);

router.get("/:id/likes", posts.listLikes);
router.post("/:id/likes", likes.like);
router.delete("/:id/likes/:userId", likes.unlike);

module.exports = router;
