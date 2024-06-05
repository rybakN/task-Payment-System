export abstract class PaymentSystem {
  readonly emissAcc: string = 'BY04CBDC36029110100040000000';
  readonly destructionAcc: string = 'BY04CBDC36029110100040000001';

  public getEmissAcc(): string {
    return this.emissAcc;
  }

  public getdestructionAcc(): string {
    return this.emissAcc;
  }
}
