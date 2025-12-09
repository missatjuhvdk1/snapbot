import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { BrowserManager } from '../automation/browser-manager';
import { SnapchatBot } from '../automation/snapchat-bot';

interface PostVideoJobData {
  accountId: string;
  videoId: string;
  jobId: string;
}

export async function processPostVideo(
  job: Job<PostVideoJobData>,
  prisma: PrismaClient,
): Promise<{ success: boolean; message: string }> {
  const { accountId, videoId, jobId } = job.data;

  try {
    // 1. Fetch account, video, and proxy from database
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { proxy: true },
    });

    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    // Update job status to PROCESSING
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    // 2. Get/create browser context
    const browserManager = new BrowserManager();
    const context = await browserManager.launchBrowser(
      accountId,
      account.proxy || undefined,
      account.cookies as any,
    );

    // 3. Initialize Snapchat bot
    const bot = new SnapchatBot(context);

    // 4. Login to Snapchat
    console.log(`🔐 Logging in to account: ${account.username}`);
    await bot.login(account.username, account.password);

    // Save cookies after login
    const cookies = await bot.getCookies();
    await prisma.account.update({
      where: { id: accountId },
      data: {
        cookies: cookies as any,
        lastLoginAt: new Date(),
      },
    });

    // 5. Upload and post video
    console.log(`📤 Uploading video: ${video.filename}`);
    await bot.postVideo(video.localPath, {
      caption: video.title || '',
    });

    // 6. Close browser
    await browserManager.closeBrowser();

    // 7. Update job status to COMPLETED
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // 8. Update account stats
    await prisma.account.update({
      where: { id: accountId },
      data: {
        postsToday: { increment: 1 },
        lastPostAt: new Date(),
        failedAttempts: 0,
      },
    });

    // 9. Create post history record
    await prisma.postHistory.create({
      data: {
        accountId,
        videoTitle: video.title,
        success: true,
        duration: Date.now() - (job.timestamp || 0),
      },
    });

    return {
      success: true,
      message: `Video posted successfully to ${account.username}`,
    };
  } catch (error: any) {
    console.error('Error processing job:', error);

    // Update job status to FAILED
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        error: error.message,
        errorStack: error.stack,
        attemptCount: { increment: 1 },
      },
    });

    // Update account failed attempts
    await prisma.account.update({
      where: { id: accountId },
      data: {
        failedAttempts: { increment: 1 },
        lastFailedAt: new Date(),
      },
    });

    throw error;
  }
}
