import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const GeneralContributionSchema = new Schema(
  {
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
    additionalComments: {
      type: String,
      required: false,
      default: '',
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
      type: String,
      required: false,
      default: false,
    },
  },
  { timestamps: true },
);

const contributionsDb = getContributionsConnection();
const GeneralContribution = contributionsDb.model(
  'general-contributions',
  GeneralContributionSchema,
);

export default GeneralContribution;
