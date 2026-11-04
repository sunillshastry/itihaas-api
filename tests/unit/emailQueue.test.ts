import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendEmail } from '@/email/queue';

const addMock = vi.hoisted(() => vi.fn());
const onMock = vi.hoisted(() => vi.fn());

// Prevent the producer from opening a real Redis connection during tests
vi.mock('@/email/config', () => ({
  QUEUE_NAME: 'email',
  createRedis: () => ({}),
}));

vi.mock('bullmq', () => ({
  Queue: class {
    add = addMock;

    on = onMock;
  },
}));

beforeEach(() => {
  addMock.mockReset();
  onMock.mockReset();
});

describe('sendEmail queue producer', () => {
  it('enqueues the job under its type and reports success', async () => {
    addMock.mockResolvedValue({ id: 'job-1' });

    const job = {
      type: 'registration' as const,
      to: 'asoka@example.com',
      name: 'Asoka',
      link: 'https://itihaas.dev/verify/token',
      expiresIn: '15 minutes',
    };

    await expect(sendEmail(job)).resolves.toBe(true);
    expect(addMock).toHaveBeenCalledWith('registration', job);
  });

  it('returns false instead of throwing when the queue is unavailable', async () => {
    addMock.mockRejectedValue(new Error('redis down'));
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const job = {
      type: 'api-key-recovery' as const,
      to: 'asoka@example.com',
      name: 'Asoka',
      userId: 'user-1',
    };

    await expect(sendEmail(job)).resolves.toBe(false);
    expect(errorSpy).toHaveBeenCalledWith(
      '[email] enqueue failed',
      'api-key-recovery',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});
