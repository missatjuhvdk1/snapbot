import { Worker } from 'bullmq';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { processPostVideo } from './processors/post-video.processor';

// Load environment variables
config();

const prisma = new PrismaClient();

// Redis connection config
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Create BullMQ worker
const worker = new Worker(
  'post-video',
  async (job) => {
    console.log(`📋 Processing job ${job.id}: ${job.name}`);
    return await processPostVideo(job, prisma);
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.MAX_CONCURRENT_JOBS || '5'),
  },
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('🤖 Worker started and listening for jobs...');
console.log(`   Redis: ${redisConnection.host}:${redisConnection.port}`);
console.log(`   Concurrency: ${process.env.MAX_CONCURRENT_JOBS || 5}`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
