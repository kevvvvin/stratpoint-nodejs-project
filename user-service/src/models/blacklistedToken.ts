import mongoose, { Schema } from 'mongoose';
import { ITokenBlacklist } from '../types/schema.types';

// Define the Role schema
const blackListedTokenSchema = new Schema<ITokenBlacklist>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create the Role model
blackListedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken = mongoose.model<ITokenBlacklist>(
  'BlacklistedToken',
  blackListedTokenSchema,
);

export default BlacklistedToken;
