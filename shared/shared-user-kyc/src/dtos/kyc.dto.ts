export class KycStatusUpdateRequestDto {
  updatedStatus: string;

  constructor(updatedStatus: string) {
    this.updatedStatus = updatedStatus;
  }
}
