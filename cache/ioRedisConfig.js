// WARNING: Removing/Commenting out the entire Redis cache check due to arising problems at the moment
// const Redis = require('ioredis');

// const redisClient = new Redis(process.env.UPSTASH_REDIS_CONNECTION_STRING, {
//   tls: {},
//   maxRetriesPerRequest: null,
//   connectTimeout: 5000,
// });

// redisClient.on('connect', function () {
//   console.log(
//     `Successfully established connection to cache storage: ${redisClient?.options?.host}`,
//   );
// });

// redisClient.on('error', function (error) {
//   console.log('Failed to connect to cache storage');
//   if (process.env.NODE_ENV === 'development') {
//     console.log(error);
//   }
// });

// // Shutdown
// process.on('SIGINT', async () => {
//   await redisClient.quit();
//   console.log('Redis connection closed');
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   await redisClient.quit();
//   console.log('Redis connection closed');
//   process.exit(0);
// });

// module.exports = redisClient;
