import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const NewRulerSchema = new Schema(
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
    bornYear: {
      type: String,
      required: false,
      default: null,
    },
    diedYear: {
      type: String,
      required: false,
      default: null,
    },
    dynasty: {
      type: String,
      required: [true, 'Dynasty is a required field'],
    },
    predecessor: {
      type: String,
      required: false,
      default: null,
    },
    successor: {
      type: String,
      required: false,
      default: null,
    },
    familyFather: {
      type: String,
      required: false,
      default: null,
    },
    familyMother: {
      type: String,
      required: false,
      default: null,
    },
    familyWives: {
      type: String,
      required: false,
      default: null,
    },
    familyChildren: {
      type: String,
      required: false,
      default: null,
    },
    religions: {
      type: String,
      required: false,
      default: null,
    },
    reignBegin: {
      type: String,
      required: false,
      default: null,
    },
    reignEnd: {
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
      required: false,
      default: null,
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
const NewRuler = contributionsDb.model('new-ruler', NewRulerSchema);

export default NewRuler;
