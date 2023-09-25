import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * auth methods
 * 1 = captcha
 * 2 = email
 * 3 - question
 * 4 - approval
 */

const schema = new Schema({
  identifier: { type: String, required: true },
  gid: { type: String, required: true },
  role: { type: String },
  createdAt: { type: Number, required: true },
  expiresAt: { type: Number, required: true },
  auth_method: { type: Number, required: true },
  number_of_uses: { type: Number, default: 0, required: true },
  issuer: { type: String, required: true },
  no_expires: { type: Boolean, required: true }
});

export const linkSchema = mongoose.model('link', schema);