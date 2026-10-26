const prisma = require("../db");

async function likePost(userId, postId) {
  const like = await prisma.like.create({
    data: { userId: userId, postId: postId },
  });
  return like;
}

async function unlikePost(userId, postId) {
  await prisma.like.delete({
    where: { userId_postId: { userId: userId, postId: postId } },
  });
}

module.exports = { likePost, unlikePost };
