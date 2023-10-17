import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Permissions
 * 1 = SUPERUSER
 * 2 = ADMIN
 * 3 = USER
 */

const schema = new Schema({
  id: { type: String, required: true },
  email: { type: String, required: true },
  permission: { type: Number, default: 3, required: true },
  createdAt: { type: Number, required: true },
  verify_key: { type: String },
  verify_expiresAt: { type: Number },
  email_send_date: { type: Number },
});

export const userSchema = mongoose.model("user", schema);
