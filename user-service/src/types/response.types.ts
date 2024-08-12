import { Types } from 'mongoose';

interface UserDetails {
  id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface KycDetails {
  id: Types.ObjectId;
  userId: Types.ObjectId;
  idType: string;
  idNumber: string;
  idExpiration: Date;
  submissionStatus: string;
}

export interface UserResponseBody {
  user: UserDetails;
}

export interface AuthResponseBody {
  token: string;
  user: UserDetails;
}

export interface KycResponseBody {
  kyc: KycDetails;
}
