export class KycUpdateNotificationRequestDto {
  userId: string;
  kycStatus: string;
  rejectionReason: string | null;

  constructor(userId: string, kycStatus: string, rejectionReason: string | null) {
    this.userId = userId;
    this.kycStatus = kycStatus;
    this.rejectionReason = rejectionReason;
  }
}
