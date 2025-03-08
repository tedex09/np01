import mongoose from 'mongoose';
import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profiles: [{
    name: String,
    avatar: String,
    preferences: {
      layout: {
        type: String,
        enum: ['netflix', 'classic'],
        default: 'netflix'
      },
      theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'dark'
      },
      effects: {
        parallax: {
          type: Boolean,
          default: true
        },
        motionBlur: {
          type: Boolean,
          default: true
        }
      }
    }
  }],
  xtreamCredentials: {
    type: String, // Encrypted credentials
    required: false
  },
  activationCode: {
    code: String,
    expiresAt: Date
  },
  viewingHistory: [{
    contentId: String,
    contentType: {
      type: String,
      enum: ['movie', 'series', 'channel']
    },
    watchedAt: Date,
    duration: Number
  }]
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Encrypt Xtream credentials
UserSchema.methods.setXtreamCredentials = function(username: string, password: string) {
  const credentials = JSON.stringify({ username, password });
  this.xtreamCredentials = CryptoJS.AES.encrypt(
    credentials,
    process.env.ENCRYPTION_KEY!
  ).toString();
};

// Decrypt Xtream credentials
UserSchema.methods.getXtreamCredentials = function() {
  if (!this.xtreamCredentials) return null;
  
  const decrypted = CryptoJS.AES.decrypt(
    this.xtreamCredentials,
    process.env.ENCRYPTION_KEY!
  ).toString(CryptoJS.enc.Utf8);
  
  return JSON.parse(decrypted);
};

export default models.User || model('User', UserSchema);