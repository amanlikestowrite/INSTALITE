const path = require("path");
const Database = require("better-sqlite3");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { users, posts, likes } = require("./seed-data");

const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((u) => ({
      username:  u.username,
      email:     u.email,
      fullname:  u.fullname,
      bio:       u.bio,
      isPrivate: u.isPrivate,
      createdAt: new Date(u.createdAt),
    })),
  });

  const usernameToId = {};
  for (const u of createdUsers) {
    usernameToId[u.username] = u.id;
  }

  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((p) => ({
      imageUrl:  p.imageUrl,
      caption:   p.caption,
      location:  p.location,
      authorId:  usernameToId[p.author],
      createdAt: new Date(p.createdAt),
    })),
  });

  const instaKeyToId = {};
  for (const p of createdPosts) {
    const match = p.imageUrl.match(/insta\d+/);
    if (match) {
      instaKeyToId[match[0]] = p.id;
    }
  }

  const createdLikes = await prisma.like.createManyAndReturn({
    data: likes.map((l) => ({
      userId: usernameToId[l.user],
      postId: instaKeyToId[l.post],
    })),
  });

  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
