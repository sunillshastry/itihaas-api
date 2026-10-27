import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const NewEntitySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is a required field'],
    },
    description: {
      type: String,
      required: false,
    },

    userName: {
      type: String,
      required: [true, "User's name is required"],
    },
    userEmail: {
      type: String,
      required: [true, "User's email is required"],
    },
    userLocation: {
      type: String,
      required: false,
    },
    enablePublicCredentials: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true },
);

const contributionsDb = getContributionsConnection();
const NewEntity = contributionsDb.model('new-entity', NewEntitySchema);

export default NewEntity;
