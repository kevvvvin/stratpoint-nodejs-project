import User from '../models/user.model';
import { IUser } from '../types/schema.types';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).populate('roles', 'name');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).populate('roles', 'name');
  }

  async findAll(): Promise<IUser[]> {
    return User.find().populate('roles', 'name');
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id: string): Promise<void> {
    await User.findByIdAndDelete(id);
  }
}
