import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Register models before the lifecycle hooks initialize their indexes.
import '../models/Dynasties';
import '../models/Rulers';
import '../models/Wars';

let mongo: MongoMemoryServer;

beforeAll(async function () {
  mongo = await MongoMemoryServer.create();

  await mongoose.connect(mongo.getUri(), {
    dbName: 'itihaas_test',
  });

  const models = mongoose.modelNames().map((name) => mongoose.model(name));
  await Promise.all(models.map((model) => model.init()));
});

afterEach(async function () {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async function () {
  await mongoose.disconnect();
  await mongo.stop();
});
