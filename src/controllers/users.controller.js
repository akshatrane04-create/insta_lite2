const usersService = require("../services/users.service");
const { getPagination, makeMeta } = require("../utils/pagination");
const { parseId } = require("../utils/ids");

async function create(req, res) {
  try {
    const { username, email, fullname, bio } = req.body;

    if (!username || !email || !fullname) {
      return res
        .status(400)
        .json({ error: "username, email and fullname are required" });
    }

    const user = await usersService.createUser({ username, email, fullname, bio });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
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

    const allowedSort = ["createdAt", "username", "fullname"];
    const sortBy = req.query.sortBy === undefined ? "createdAt" : req.query.sortBy;
    if (!allowedSort.includes(sortBy)) {
      return res
        .status(400)
        .json({ error: "sortBy must be one of: createdAt, username, fullname" });
    }

    const order = req.query.order === undefined ? "desc" : req.query.order;
    if (order !== "asc" && order !== "desc") {
      return res.status(400).json({ error: "order must be asc or desc" });
    }

    let isPrivate = undefined;
    if (req.query.isPrivate !== undefined) {
      if (req.query.isPrivate === "true") {
        isPrivate = true;
      } else if (req.query.isPrivate === "false") {
        isPrivate = false;
      } else {
        return res.status(400).json({ error: "isPrivate must be true or false" });
      }
    }

    let hasPosts = undefined;
    if (req.query.hasPosts !== undefined) {
      if (req.query.hasPosts === "true") {
        hasPosts = true;
      } else if (req.query.hasPosts === "false") {
        hasPosts = false;
      } else {
        return res.status(400).json({ error: "hasPosts must be true or false" });
      }
    }


    let search = undefined;
    if (typeof req.query.search === "string") {
      search = req.query.search;
    }

    const result = await usersService.listUsers({
      page, limit, sortBy, order, isPrivate, search, hasPosts,
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
      return res.status(404).json({ error: "User not found" });
    }

    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function update(req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: "User not found" });
    }

    const { fullname, bio, isPrivate } = req.body;

    if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
      return res.status(400).json({ error: "isPrivate must be true or false" });
    }

    const user = await usersService.updateUser(id, { fullname, bio, isPrivate });
    res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function remove(req, res) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: "User not found" });
    }

    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function listPosts(req, res) {
  try {
    const pagination = getPagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit } = pagination;

    const id = parseId(req.params.id);
    if (id === null || !(await usersService.userExists(id))) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await usersService.listUserPosts(id, page, limit);
    res.status(200).json({
      data: result.data,
      meta: makeMeta(page, limit, result.total),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function listLikedPosts(req, res) {
  try {
    const pagination = getPagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit } = pagination;

    const id = parseId(req.params.id);
    if (id === null || !(await usersService.userExists(id))) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await usersService.listLikedPosts(id, page, limit);
    res.status(200).json({
      data: result.data,
      meta: makeMeta(page, limit, result.total),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { create, list, getOne, update, remove, listPosts, listLikedPosts };
