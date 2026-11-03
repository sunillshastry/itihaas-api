import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const NewWarSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is a required field'],
      unique: false,
    },
    otherNames: {
      type: String,
      required: false,
      default: null,
    },
    timelineBegin: {
      type: String,
      required: false,
      default: null,
    },
    timelineEnd: {
      type: String,
      required: false,
      default: null,
    },
    winners: {
      type: String,
      required: false,
      default: null,
    },
    losers: {
      type: String,
      required: false,
      default: null,
    },
    casualties: {
      type: String,
      required: false,
      default: null,
    },
    locations: {
      type: String,
      required: false,
      default: null,
    },
    leadersWinners: {
      type: String,
      required: false,
      default: null,
    },
    leadersLosers: {
      type: String,
      required: false,
      default: null,
    },
    causes: {
      type: String,
      required: false,
      default: null,
    },
    descriptionShort: {
      type: String,
      required: [true, 'Description (Short) is a required field'],
      unique: false,
    },
    descriptionLong: {
      type: String,
      required: false,
      default: null,
    },
    sources: {
      type: String,
      required: [true, 'Sources is a required field'],
      unique: false,
    },
    furtherReading: {
      type: String,
      required: false,
      default: null,
    },
    articles: {
      type: String,
      required: false,
      default: null,
    },

    // Contribution specific fields
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
const NewWar = contributionsDb.model('new-war', NewWarSchema);

export default NewWar;
