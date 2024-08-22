import { IUser } from '../types';
import { User } from '../models';
import { Types } from 'mongoose';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return await User.findById(new Types.ObjectId(id)).populate('roles', 'name');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).populate('roles', 'name');
  }

  async findAll(): Promise<IUser[]> {
    return await User.find().populate('roles', 'name');
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(new Types.ObjectId(id), updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id: string): Promise<void> {
    await User.findByIdAndDelete(new Types.ObjectId(id));
  }
}
