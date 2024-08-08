import mongoose, { Schema } from 'mongoose';
import { IRole } from '../types/schema.types';
import { RoleEnum } from '../enums/role.enum';

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
const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
