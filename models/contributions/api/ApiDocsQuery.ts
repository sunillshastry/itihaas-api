import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const ApiDocsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['api', 'docs'],
      required: [true, 'Type is a required field'],
      unique: false,
    },
    subject: {
      type: String,
      required: [true, 'Subject is a required field'],
      unique: false,
    },
    description: {
      type: String,
      required: [true, 'Description is a required field'],
      unique: false,
    },
    fixComments: {
      type: String,
      required: false,
      default: null,
    },
    additionalComments: {
      type: String,
      required: false,
      default: null,
    },

    userName: {
      type: String,
      required: [true, 'User name is a required field'],
      unique: false,
    },
    userEmail: {
      type: String,
      required: [true, 'User email is a required field'],
      unique: false,
    },
    userLocation: {
      type: String,
      required: false,
      default: null,
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
const ApiDocsQuery = contributionsDb.model('api-docs', ApiDocsSchema);

export default ApiDocsQuery;
