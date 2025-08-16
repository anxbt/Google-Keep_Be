"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting to seed the database...');
        // Clean up existing data
        console.log('Cleaning up existing data...');
        yield prisma.link.deleteMany({});
        yield prisma.post.deleteMany({});
        yield prisma.user.deleteMany({});
        // Create users
        console.log('Creating users...');
        const user1 = yield prisma.user.create({
            data: {
                username: 'john_doe',
                password: 'password123', // In a real app, this should be hashed
            },
        });
        const user2 = yield prisma.user.create({
            data: {
                username: 'jane_smith',
                password: 'password456', // In a real app, this should be hashed
            },
        });
        console.log(`Created users: ${user1.username}, ${user2.username}`);
        // Create posts
        console.log('Creating posts...');
        const post1 = yield prisma.post.create({
            data: {
                title: 'Getting Started with Prisma',
                content: 'Prisma is a next-generation ORM that makes working with databases easy.',
            },
        });
        const post2 = yield prisma.post.create({
            data: {
                title: 'Building a REST API with Express and Prisma',
                content: 'Learn how to build a REST API using Express.js and Prisma ORM.',
            },
        });
        const post3 = yield prisma.post.create({
            data: {
                title: 'PostgreSQL vs MongoDB',
                content: 'A comparison between PostgreSQL and MongoDB for modern web applications.',
            },
        });
        console.log(`Created ${3} posts`);
        // Create links
        console.log('Creating links...');
        const link1 = yield prisma.link.create({
            data: {
                hash: 'abc123xyz',
                userId: user1.id,
            },
        });
        const link2 = yield prisma.link.create({
            data: {
                hash: 'def456uvw',
                userId: user2.id,
            },
        });
        console.log(`Created ${2} links`);
        console.log('Seeding completed successfully!');
    });
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    // Close the Prisma client
    yield prisma.$disconnect();
}));
