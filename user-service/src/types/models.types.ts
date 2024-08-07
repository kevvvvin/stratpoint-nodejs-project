export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  checkPassword(candidatePassword: string): Promise<boolean>;
}
