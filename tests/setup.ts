import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Register models before the lifecycle hooks initialize their indexes.
import '../models/Dynasties';
import '../models/Rulers';
import '../models/Wars';
import '../models/Users';
import { getUsersConnection } from '../database/config';

let mongo: MongoMemoryServer;

beforeAll(async function () {
  mongo = await MongoMemoryServer.create();

  await mongoose.connect(mongo.getUri(), {
    dbName: 'itihaas_test',
  });

  const models = mongoose.modelNames().map((name) => mongoose.model(name));
  await Promise.all(models.map((model) => model.init()));

  const usersDb = getUsersConnection();
  const userModels = usersDb.modelNames().map((name) => usersDb.model(name));
  await Promise.all(userModels.map((model) => model.init()));
});

afterEach(async function () {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );

  const usersDb = getUsersConnection();
  if (usersDb?.collections) {
    await Promise.all(
      Object.values(usersDb.collections).map((collection) =>
        collection.deleteMany({}),
      ),
    );
  }
});

afterAll(async function () {
  await mongoose.disconnect();
  await mongo.stop();
});
