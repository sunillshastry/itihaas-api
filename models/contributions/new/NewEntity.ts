import { model, Schema } from 'mongoose';

const NewEntitySchema = new Schema({
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
});

const NewEntity = model('new-entity-contribution', NewEntitySchema);

export default NewEntity;
