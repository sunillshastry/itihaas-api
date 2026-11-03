import { getUsersConnection } from '@/database/config';
import { Schema } from 'mongoose';

const UsersSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: false,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is a required field'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    usageReason: {
      type: String,
      required: false,
    },
    privacyAgreement: {
      type: Boolean,
      required: true,
    },
    captcha: {
      type: String,
      required: [true, 'Captcha value is a required field'],
      unique: false,
    },
    apiKey: {
      type: String,
      required: [true, 'ApiKey is a required field'],
      unique: true,
      index: true,
    },
    verified: {
      type: Boolean,
    },
  },
  { timestamps: true },
);

const usersDb = getUsersConnection();

const Users = usersDb.model('User', UsersSchema);
export default Users;
