import { IBAN, CountryCode } from 'ibankit';

type account = {
  name: string;
  sum: number;
  block: boolean;
};

export class PaymentSystem {
  private emissAcc: account = {
    name: 'BY04CBDC36029110100040000000',
    sum: 0,
    block: false,
  };
  private destructionAcc: account = {
    name: 'BY04CBDC36029110100040000001',
    sum: 0,
    block: false,
  };

  private allAccount: account[] = [this.emissAcc, this.destructionAcc];

  private findeAcc(accName: string): { acc: account; index: number } | null {
    let accIndex: number | null = 0;
    let acc = this.allAccount.find((item, index) => {
      item.name === accName ? (accIndex = index) : false;
    });

    if (!acc) return null;

    return { acc, index: accIndex };
  }

  private executTransaction(
    firstAcc: string,
    secondAcc: string,
    sum: number,
  ): void {
    const firstAccIndex = this.findeAcc(firstAcc!);
    const secondAccIndex = this.findeAcc(secondAcc!);

    if (
      firstAccIndex &&
      secondAcc &&
      this.allAccount[firstAccIndex!.index].sum >= sum
    ) {
      this.allAccount[firstAccIndex!.index].sum -= sum!;
      this.allAccount[secondAccIndex!.index].sum += sum!;
    }
    return;
  }

  // вывод в консоль специального номера счета для "эмиссии"
  public getEmissAccNum(): void {
    console.log(
      `Номер специального счета для "эмиссии": ${this.destructionAcc.name}`,
    );
  }

  // вывод в консоль специального номера счета для "уничтожения"
  public getDestructionAccNum(): void {
    console.log(
      `Номер специального счета для "уничтожения": ${this.destructionAcc.name}`,
    );
  }

  // получение всех счетов в формате JSON
  public getAllAcc(): void {
    console.log(JSON.stringify(this.allAccount));
  }

  // осуществление эмисси, по добавлению на счет “эмиссии” указанной суммы
  public emissAddSum(sum: number): void {
    this.emissAcc.sum += sum;
  }

  // осуществление отправки определенной суммы денег с указанного счета на счет “уничтожения”
  public destruction(accName: string, sum: number): void {
    const acc = this.findeAcc(accName);
    if (!acc) {
      console.log(`Счет с номером: ${accName} не найден.`);
      return;
    }

    if (this.allAccount[acc.index].sum < sum) {
      console.log(`На счету ${accName} недостаточно средств.`);
      return;
    }

    this.emissAcc.sum -= sum;
    this.allAccount[acc.index].sum -= sum;
  }

  // создание нового счета
  public createNewAcc(): string {
    const newAcc = {
      name: IBAN.random(CountryCode.BY).toString(),
      sum: 0,
    };
    this.allAccount.push(newAcc);
    return JSON.stringify(newAcc);
  }

  // перевод заданной суммы денег между двумя указанными
  public transferMoney(
    firstAcc?: string,
    secondAcc?: string,
    sum?: number,
    body?: string,
  ): void {
    const argLength = arguments.length;
    if (argLength != 1 && argLength != 3) {
      console.log('Не верные параметры');
      return;
    }

    if (argLength === 3) {
      this.executTransaction(firstAcc!, secondAcc!, sum!);
      return;
    }

    if (argLength === 1) {
      const { firstAcc, secondAcc, sum } = JSON.parse(body!);
      this.executTransaction(firstAcc, secondAcc, sum);
      return;
    }
  }
}

const ps = new PaymentSystem(); // создание экземпляра класса платежной системы
ps.getDestructionAccNum();
ps.getEmissAccNum();
for (let i = 0; i < 3; i++) ps.createNewAcc();
ps.getAllAcc();
