const prisma = require("../db");

const userSummary = { id: true, username: true, fullname: true };

async function createPost(data) {
  const post = await prisma.post.create({
    data: {
      imageUrl: data.imageUrl,
      caption: data.caption,
      location: data.location,
      authorId: data.authorId,
    },
  });
  return post;
}

async function listPosts(options) {
  const { page, limit, sortBy, order, location, search, from, to } = options;

  const where = {};

  if (location !== undefined) {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt.gte = from;
    }
    if (to) {
      where.createdAt.lt = to; 
    }
  }

  let orderBy;
  if (sortBy === "likes") {
  
    orderBy = [{ likes: { _count: order } }, { createdAt: "desc" }];
  } else {
    orderBy = [{ [sortBy]: order }];
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: where,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: userSummary },
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({ where: where }),
  ]);

  return { data, total };
}

async function getPostById(id) {
  const post = await prisma.post.findUnique({
    where: { id: id },
    include: {
      author: { select: userSummary },
      _count: { select: { likes: true } },
    },
  });
  return post;
}

async function updatePost(id, data) {
  const post = await prisma.post.update({
    where: { id: id },
    data: {
      caption: data.caption,
      location: data.location,
    },
  });
  return post;
}

async function deletePost(id) {
  await prisma.post.delete({ where: { id: id } });
}

async function postExists(id) {
  const post = await prisma.post.findUnique({
    where: { id: id },
    select: { id: true },
  });
  return post !== null;
}

async function listPostLikers(postId) {
  const users = await prisma.user.findMany({
    where: { likes: { some: { postId: postId } } },
    orderBy: { username: "asc" },
    select: userSummary,
  });
  return users;
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  postExists,
  listPostLikers,
};
