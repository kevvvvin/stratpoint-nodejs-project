export class EmailVerificationNotificationRequestDto {
  userId: string;
  emailVerificationToken: string;

  constructor(userId: string, emailVerificationToken: string) {
    this.userId = userId;
    this.emailVerificationToken = emailVerificationToken;
  }
}
