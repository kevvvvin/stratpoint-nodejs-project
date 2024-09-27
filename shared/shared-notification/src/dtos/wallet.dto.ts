export class CreateWalletNotificationRequestDto {
  initialBalance: number;

  constructor(initialBalance: number) {
    this.initialBalance = initialBalance;
  }
}

export class AddPaymentMethodNotificationRequestDto {
  last4: string;
  brand: string;

  constructor(last4: string, brand: string) {
    this.last4 = last4;
    this.brand = brand;
  }
}

export class DepositNotificationRequestDto {
  amount: number;
  transactionId: string;

  constructor(amount: number, transactionId: string) {
    this.amount = amount;
    this.transactionId = transactionId;
  }
}

export class WithdrawNotificationRequestDto {
  amount: number;
  newBalance: number;
  transactionId: string;
  withdrawalStatus: string;
  withdrawalMethod: string;

  constructor(
    amount: number,
    newBalance: number,
    transactionId: string,
    withdrawalStatus: string,
    withdrawalMethod: string,
  ) {
    this.amount = amount;
    this.newBalance = newBalance;
    this.transactionId = transactionId;
    this.withdrawalStatus = withdrawalStatus;
    this.withdrawalMethod = withdrawalMethod;
  }
}

export class TransferNotificationRequestDto {
  toUserId: string;
  amount: number;
  transactionId: string;
  fromBalance: number;
  toBalance: number;

  constructor(
    toUserId: string,
    amount: number,
    transactionId: string,
    fromBalance: number,
    toBalance: number,
  ) {
    this.toUserId = toUserId;
    this.amount = amount;
    this.transactionId = transactionId;
    this.fromBalance = fromBalance;
    this.toBalance = toBalance;
  }
}
