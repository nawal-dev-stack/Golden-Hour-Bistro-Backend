import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  idea: { type: String, required: true, trim: true },
  initials: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('CommunityPost', communityPostSchema);
