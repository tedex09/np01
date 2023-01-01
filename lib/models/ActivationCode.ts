import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';

const ActivationCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true, // Add index for better query performance
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true, // Add index for better query performance
  },
  isActivated: {
    type: Boolean,
    default: false,
    index: true, // Add index for better query performance
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true, // Add index for better query performance
  }
}, {
  timestamps: true // Add timestamps for tracking
});

// Add compound index for common queries
ActivationCodeSchema.index({ code: 1, expiresAt: 1, isActivated: 1 });

export default models.ActivationCode || model('ActivationCode', ActivationCodeSchema);