import 'dotenv/config';
import { UnrecoverableError, Worker } from 'bullmq';
import mongoose from 'mongoose';
import Users from '@/models/Users';
import { createRedis, QUEUE_NAME } from './config';
import { deliver } from './provider';
import { renderEmail } from './templates';
import type { EmailJob } from './types';

async function main() {
  await mongoose.connect(process.env['MONGO_DB_CONNECTION_STRING']!); // reuse your existing connect helper/env name

  const worker = new Worker<EmailJob>(
    QUEUE_NAME,
    async (job) => {
      const data = job.data;
      let apiKey: string | undefined;

      // Both API-key emails fetch the key from the database
      // so it is never stored in Redis
      if (
        data.type === 'verification-success' ||
        data.type === 'api-key-recovery'
      ) {
        const user = await Users.findById(data.userId).lean();
        if (!user) throw new UnrecoverableError('User no longer exists');
        if (!user.apiKey) throw new UnrecoverableError('User has no API key');
        apiKey = user.apiKey;
      }

      const { subject, html, text } = renderEmail(data, apiKey);
      await deliver({
        to: data.to,
        subject,
        html,
        text,
        idempotencyKey: `email-${job.id}`,
      });
    },
    {
      connection: createRedis('worker'),
      concurrency: 5,
      limiter: { max: 2, duration: 1000 }, // Resend's default is 2 req/s
    },
  );

  worker.on('completed', (job) =>
    console.log(`[email] sent ${job.name} (${job.id})`),
  );
  worker.on('failed', (job, err) =>
    console.error(
      `[email] failed ${job?.name} (${job?.id}) attempt ${job?.attemptsMade}/${job?.opts.attempts}: ${err.message}`,
    ),
  );
  worker.on('error', (err) =>
    console.error('[email] worker error', err.message),
  );

  const shutdown = async () => {
    await worker.close(); // finishes in-flight jobs
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
