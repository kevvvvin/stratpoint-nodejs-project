import { Types } from 'mongoose';

interface UserDetails {
  id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface UserResponseBody {
  user: UserDetails;
}

export interface AuthResponseBody {
  token: string;
  user: UserDetails;
}
