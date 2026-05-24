import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  vibe: { type: String },
  isAvailable: { type: Boolean, default: true },
  tags: [String],
  ingredients: [String]
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
