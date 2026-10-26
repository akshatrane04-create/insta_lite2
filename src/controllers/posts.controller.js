const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");
const { getPagination, makeMeta } = require("../utils/pagination");
const { parseId } = require("../utils/ids");

async function create(req, res) {
  try {
    const { imageUrl, caption, location, authorId } = req.body;

    if (!imageUrl || authorId === undefined || authorId === null) {
      return res
        .status(400)
        .json({ error: "imageUrl and authorId are required" });
    }

    if (!Number.isInteger(authorId) || !(await usersService.userExists(authorId))) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await postsService.createPost({
      imageUrl, caption, location, authorId,
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function list(req, res) {
  try {
    const pagination = getPagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit } = pagination;

    const allowedSort = ["createdAt", "updatedAt", "likes"];
    const sortBy = req.query.sortBy === undefined ? "createdAt" : req.query.sortBy;
    if (!allowedSort.includes(sortBy)) {
      return res
        .status(400)
        .json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
    }

    const order = req.query.order === undefined ? "desc" : req.query.order;
    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({ error: "order must be asc or desc" });
    }

    let from = undefined;
    let to = undefined;
    if (req.query.from !== undefined) {
      from = new Date(req.query.from);
    }
    if (req.query.to !== undefined) {
      to = new Date(req.query.to);
    }
    if ((from && isNaN(from.getTime())) || (to && isNaN(to.getTime()))) {
      return res.status(400).json({ error: "from and to must be valid dates" });
    }

    let location = undefined;
    if (typeof req.query.location === "string") {
      location = req.query.location;
    }
    let search = undefined;
    if (typeof req.query.search === "string") {
      search = req.query.search;
    }

    const result = await postsService.listPosts({
      page, limit, sortBy, order, location, search, from, to,
    });

    res.status(200).json({
      data: result.data,
      meta: makeMeta(page, limit, result.total),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function getOne(req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: "Post not found" });
    }

    const post = await postsService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function update(req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: "Post not found" });
    }

  
    const { caption, location } = req.body;

    const post = await postsService.updatePost(id, { caption, location });
    res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function remove(req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: "Post not found" });
    }

    await postsService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function listLikes(req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null || !(await postsService.postExists(id))) {
      return res.status(404).json({ error: "Post not found" });
    }

    const users = await postsService.listPostLikers(id);
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { create, list, getOne, update, remove, listLikes };
