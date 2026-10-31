import { Queue } from 'bullmq';
import { createRedis, QUEUE_NAME } from './config';
import type { EmailJob } from './types';

const queue = new Queue<EmailJob>(QUEUE_NAME, {
  connection: createRedis('producer'),
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 3600, count: 500 },
    removeOnFail: { age: 7 * 24 * 3600 }, // keep failures a week for debugging
  },
});

queue.on('error', (err) => {
  if (process.env?.['NODE_ENV'] === 'development') {
    console.error('[email] queue error', err.message);
  }
});

/** Fire-and-forget. Never throws: a Redis outage shouldn't 500 a registration. */
export async function sendEmail(job: EmailJob): Promise<boolean> {
  try {
    await queue.add(job.type, job);
    return true;
  } catch (err) {
    console.error('[email] enqueue failed', job.type, err);
    return false;
  }
}
