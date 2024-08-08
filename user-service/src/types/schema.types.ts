import { Types } from 'mongoose';
import { RoleEnum } from '../enums/role.enum';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: IRole[];
  checkPassword(candidatePassword: string): Promise<boolean>;
}

export interface IRole extends Document {
  name: RoleEnum;
  description: string;
}
