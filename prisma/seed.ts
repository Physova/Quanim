import "dotenv/config";
import { Role } from '../lib/generated-prisma/client.js'
import prisma from "../lib/prisma"

async function main() {
  console.log('Start seeding...')

  // 1. Seed Mock Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quanim.com' },
    update: {},
    create: {
      email: 'admin@quanim.com',
      name: 'Quanim Admin',
      role: Role.ADMIN,
    },
  })

  const author = await prisma.user.upsert({
    where: { email: 'author@quanim.com' },
    update: {},
    create: {
      email: 'author@quanim.com',
      name: 'Physics Author',
      role: Role.USER,
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@quanim.com' },
    update: {},
    create: {
      email: 'user@quanim.com',
      name: 'Curious Student',
      role: Role.USER,
    },
  })

  console.log({ admin, author, user })

  // 2. Seed Initial Articles
  const articles = [
    {
      slug: 'double-slit',
      title: 'Double-Slit Experiment',
      description: 'Explore wave-particle duality and quantum interference patterns through the famous double-slit experiment.',
      tags: ['quantum', 'physics', 'waves'],
      difficulty: 'Intermediate',
      content: '# Double-Slit Experiment\n\nThe double-slit experiment is a demonstration that light and matter can display characteristics of both classically defined waves and particles.',
    },
    {
      slug: 'entanglement',
      title: 'Quantum Entanglement',
      description: "Explore Einstein's 'spooky action at a distance' and correlated particle states in quantum entanglement.",
      tags: ['quantum', 'physics', 'entanglement'],
      difficulty: 'Advanced',
      content: '# Quantum Entanglement\n\nQuantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others.',
    },
    {
      slug: 'superposition',
      title: 'Quantum Superposition',
      description: 'Observe a particle exist in multiple states until measurement collapses the wavefunction in this superposition simulation.',
      tags: ['quantum', 'physics', 'superposition'],
      difficulty: 'Beginner',
      content: '# Quantum Superposition\n\nQuantum superposition is a fundamental principle of quantum mechanics. It states that, much like waves in classical physics, any two (or more) quantum states can be added together ("superposed") and the result will be another valid quantum state.',
    },
  ]

  for (const articleData of articles) {
    const { tags, ...rest } = articleData;
    const article = await prisma.article.upsert({
      where: { slug: articleData.slug },
      update: {
        ...rest,
        tags: tags.join(','),
      },
      create: {
        ...rest,
        tags: tags.join(','),
        authorId: author.id,
        published: true,
        publishedAt: new Date(),
      },
    })
    console.log(`Created article: ${article.title}`)
  }

  // 3. Verify Relations (Mock Comment)
  const dsArticle = await prisma.article.findUnique({ where: { slug: 'double-slit' } });
  if (dsArticle) {
    const comment = await prisma.comment.create({
      data: {
        content: 'This is a fascinating topic!',
        authorId: user.id,
        articleId: dsArticle.id,
      },
    })
    console.log('Created verification comment:', comment)
  }

  // 4. Seed Community Threads
  const globalThread = await prisma.thread.upsert({
    where: { id: 'global-discussion' },
    update: {},
    create: {
      id: 'global-discussion',
      title: 'Global Discussion',
      authorId: admin.id,
    },
  })
  console.log('Created global thread:', globalThread.title)

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
