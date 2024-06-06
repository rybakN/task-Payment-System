import { IBAN, CountryCode } from 'ibankit';

type Account = {
  name: string;
  sum: number;
  block: boolean;
};

export class PaymentSystem {
  private emissAccount: Account = {
    name: 'BY04CBDC36029110100040000000',
    sum: 0,
    block: false,
  };
  private destructionAcc: Account = {
    name: 'BY04CBDC36029110100040000001',
    sum: 0,
    block: false,
  };

  private allAccounts: Map<string, Account>;

  constructor() {
    this.allAccounts = new Map();
    this.allAccounts.set(this.emissAccount.name, this.emissAccount);
    this.allAccounts.set(this.destructionAcc.name, this.destructionAcc);
  }

  private checkAccount(accountName: string, sum?: number): Account {
    const account = this.allAccounts.get(accountName);

    if (!account) {
      throw new Error(`ОШИБКА: Cчета ${accountName} не существует`);
    }

    if (!sum) {
    } else if (account.sum < sum) {
      throw new Error(`ОШИБКА: На счету ${account.name} недостаточно средств`);
    }

    if (account.block) {
      throw new Error(`ОШИБКА: Счет ${account.name} заблокирован`);
    }

    return account;
  }

  private executTransaction(
    firstAccountName: string,
    secondAccountName: string,
    sum: number,
  ): void {
    const firstAccount = this.checkAccount(firstAccountName, sum);
    const secondAccount = this.checkAccount(secondAccountName, sum);

    firstAccount.sum -= sum;
    secondAccount.sum += sum;
    console.log(
      `Перевод денежных средств со счета ${firstAccount.name} на счет ${secondAccount.name} выполнен`,
    );
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
  public getAllAccount(): void {
    const allAccounts: Account[] = [];
    for (let account of this.allAccounts.values()) {
      allAccounts.push(account);
    }
    console.log(JSON.stringify(allAccounts));
  }

  // осуществление эмисси, по добавлению на счет “эмиссии” указанной суммы
  public emissAddSum(sum: number): void {
    this.allAccounts.get(this.emissAccount.name)!.sum += sum;
  }

  // осуществление отправки определенной суммы денег с указанного счета на счет “уничтожения”
  public destructionMoney(accountName: string, sum: number): void {
    try {
      const account = this.checkAccount(accountName, sum);
      this.emissAccount.sum -= sum;
      account.sum -= sum;
    } catch (error) {
      console.log(error.message);
    }
  }

  // создание нового счета
  public createNewAccount(): Account {
    const newAccount: Account = {
      name: IBAN.random(CountryCode.BY).toString(),
      sum: 0,
      block: false,
    };
    this.allAccounts.set(newAccount.name, newAccount);
    console.log(`Создан новый счет: ${JSON.stringify(newAccount)}`);
    return newAccount;
  }

  // перевод заданной суммы денег между двумя указанными
  public transferMoney(
    firstAccount?: string,
    secondAccount?: string,
    sum?: number,
    body?: string,
  ): void {
    const argLength = arguments.length;
    if (argLength != 1 && argLength != 3) {
      console.log('Не верные параметры');
      return;
    }

    if (argLength === 3) {
      try {
        this.executTransaction(firstAccount!, secondAccount!, sum!);
      } catch (error) {
        console.log(error.message);
      }
    }

    if (argLength === 1) {
      const { firstAccount, secondAccount, sum } = JSON.parse(body!);
      try {
        this.executTransaction(firstAccount!, secondAccount!, sum!);
      } catch (error) {
        console.log(error.message);
      }
    }
  }
}

const ps = new PaymentSystem(); // создание экземпляра класса платежной системы
ps.getDestructionAccNum();
ps.getEmissAccNum();
ps.emissAddSum(300);
for (let i = 0; i < 3; i++) ps.createNewAccount();
ps.getAllAccount();
ps.transferMoney('11', '22', 45);
ps.destructionMoney('23', 900);
