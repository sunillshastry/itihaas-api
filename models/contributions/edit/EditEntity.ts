import { getContributionsConnection } from '@/database/config';
import { Schema } from 'mongoose';

const EditEntitySchema = new Schema(
  {
    entity: {
      type: String,
      enum: ['war', 'dynasty', 'ruler'],
      required: true,
      unique: false,
    },
    name: {
      type: String,
      required: [true, 'Name is a required field'],
      unique: false,
    },
    link: {
      type: String,
      required: [true, 'Link is a required field'],
      unique: false,
    },
    fieldName: {
      type: String,
      required: [true, 'Field name is a required field'],
      unique: false,
    },
    fieldContent: {
      type: String,
      required: [true, 'Field content is a required field'],
      unique: false,
    },
    sources: {
      type: String,
      required: [true, 'Sources is a required field'],
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
      default: '',
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
const EditEntity = contributionsDb.model('edit-entity', EditEntitySchema);

export default EditEntity;
