import mongoose, { Schema } from 'mongoose';
import { RoleEnum } from '../enums';
import { IRole } from '../types';

// Define the Role schema
const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    enum: Object.values(RoleEnum),
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

// Create the Role model
export const Role = mongoose.model<IRole>('Role', roleSchema);
