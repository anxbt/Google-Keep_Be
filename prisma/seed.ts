import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed the database...');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.link.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.user.deleteMany({});

  // Create users
  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      username: 'john_doe',
      password: 'password123', // In a real app, this should be hashed
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'jane_smith',
      password: 'password456', // In a real app, this should be hashed
    },
  });

  console.log(`Created users: ${user1.username}, ${user2.username}`);

  // Create posts
  console.log('Creating posts...');
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with Prisma',
      content: 'Prisma is a next-generation ORM that makes working with databases easy.',
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Building a REST API with Express and Prisma',
      content: 'Learn how to build a REST API using Express.js and Prisma ORM.',
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'PostgreSQL vs MongoDB',
      content: 'A comparison between PostgreSQL and MongoDB for modern web applications.',
    },
  });

  console.log(`Created ${3} posts`);

  // Create links
  console.log('Creating links...');
  const link1 = await prisma.link.create({
    data: {
      hash: 'abc123xyz',
      userId: user1.id,
    },
  });

  const link2 = await prisma.link.create({
    data: {
      hash: 'def456uvw',
      userId: user2.id,
    },
  });

  console.log(`Created ${2} links`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close the Prisma client
    await prisma.$disconnect();
  });
