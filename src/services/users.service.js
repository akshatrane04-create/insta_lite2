const prisma = require("../db");

const userSummary = { id: true, username: true, fullname: true };

async function createUser(data) {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      fullname: data.fullname,
      bio: data.bio,
    },
  });
  return user;
}

async function listUsers(options) {
  const { page, limit, sortBy, order, isPrivate, search, hasPosts } = options;

  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  if (hasPosts === true) {
    where.posts = { some: {} };
  } else if (hasPosts === false) {
    where.posts = { none: {} };
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where: where }),
  ]);

  return { data, total };
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: {
      _count: { select: { posts: true, likes: true } },
    },
  });
  return user;
}

async function updateUser(id, data) {
 
  const user = await prisma.user.update({
    where: { id: id },
    data: {
      fullname: data.fullname,
      bio: data.bio,
      isPrivate: data.isPrivate,
    },
  });
  return user;
}

async function deleteUser(id) {
  await prisma.user.delete({ where: { id: id } });
}

async function userExists(id) {
  const user = await prisma.user.findUnique({
    where: { id: id },
    select: { id: true },
  });
  return user !== null;
}

async function listUserPosts(userId, page, limit) {
  const where = { authorId: userId };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { likes: true } } },
    }),
    prisma.post.count({ where: where }),
  ]);

  return { data, total };
}

async function listLikedPosts(userId, page, limit) {
  const where = { likes: { some: { userId: userId } } };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
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

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  userExists,
  listUserPosts,
  listLikedPosts,
};
