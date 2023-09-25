import mongoose from 'mongoose';
const { Schema } = mongoose;

const schema = new Schema({
  gid: { type: String, required: true },
  owner: { type: String, required: true },
  joinedAt: { type: Number, required: true }
});

export const guildSchema = mongoose.model('guild', schema);