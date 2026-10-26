const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {

  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();


  const createdUsers = await prisma.user.createManyAndReturn({
    data: users,
  });

  const userIds = {};
  for (const u of createdUsers) {
    userIds[u.username] = u.id;
  }


  const postData = posts.map((p) => {
    return {
      imageUrl: p.imageUrl,
      caption: p.caption,
      location: p.location,
      createdAt: p.createdAt,
      authorId: userIds[p.author],
    };
  });
  const createdPosts = await prisma.post.createManyAndReturn({
    data: postData,
  });


  const postIds = {};
  for (const p of createdPosts) {
    const key = p.imageUrl.split("/")[4]; 
    postIds[key] = p.id;
  }


  const likeData = likes.map((l) => {
    return {
      userId: userIds[l.user],
      postId: postIds[l.post],
    };
  });
  const createdLikes = await prisma.like.createMany({
    data: likeData,
  });


  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
