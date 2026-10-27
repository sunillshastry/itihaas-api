import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const NewDynastySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is a required field'],
    },
    otherNames: {
      type: String,
      required: false,
      default: null,
    },
    timeline: {
      begin: {
        type: String,
        required: [true, 'Timeline (begin) is a required field'],
      },
      end: {
        type: String,
        required: [true, 'Timeline (end) is a required field'],
      },
    },
    capitals: {
      type: String,
      required: false,
      default: null,
    },
    currencies: {
      type: String,
      required: false,
      default: null,
    },
    locations: {
      type: String,
      required: false,
      default: null,
    },
    languages: {
      type: String,
      required: false,
      default: null,
    },
    population: {
      type: String,
      required: false,
      default: null,
    },
    area: {
      type: String,
      required: false,
      default: null,
    },
    religions: {
      type: String,
      required: false,
      default: null,
    },
    descriptionShort: {
      type: String,
      required: [true, 'Description (short) is a required field'],
      maxLength: 255,
    },
    descriptionLong: {
      type: String,
      required: false,
      default: null,
      maxLength: 2500,
    },
    sources: {
      type: String,
      required: [true, 'Sources is a required field'],
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
    },

    userEmail: {
      type: String,
      required: [true, 'User email is a required field'],
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
const NewDynasty = contributionsDb.model('new-dynasty', NewDynastySchema);

export default NewDynasty;
