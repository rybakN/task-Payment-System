import { IBAN, CountryCode } from 'ibankit';

type Account = {
  name: string;
  sum: number;
  block: boolean;
};

interface IPaymentSystem {
  getEmissAccountNumber(): string;
  getDestructionAccountNumber(): string;
  addEmission(sum: number): void;
  destructMoney(accountName: string, sum: number): void;
  createNewAccount(): Account;
  transferMoney(firstAccount: string, secondAccount: string, sum: number): void;
  transferMoneyJSON(body: string): void;
  getAllAccounts(): string;
}

export class PaymentSystem implements IPaymentSystem {
  private emissAccount: Account = {
    name: 'BY04CBDC36029110100040000000',
    sum: 0,
    block: false,
  };
  private destructionAccount: Account = {
    name: 'BY04CBDC36029110100040000001',
    sum: 0,
    block: false,
  };

  private allAccounts: Map<string, Account>;

  constructor() {
    this.allAccounts = new Map();
    this.allAccounts.set(this.emissAccount.name, this.emissAccount);
    this.allAccounts.set(this.destructionAccount.name, this.destructionAccount);
  }

  private getAccountAndValidate(accountName: string, sum?: number): Account {
    const account = this.allAccounts.get(accountName);

    if (!account) {
      throw new Error(`ОШИБКА: Cчет ${accountName} не существует`);
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
    fromAccountNumber: string,
    toAccountNumber: string,
    sum: number,
  ): void {
    const firstAccount = this.getAccountAndValidate(fromAccountNumber, sum);
    const secondAccount = this.getAccountAndValidate(toAccountNumber);

    firstAccount.sum -= sum;
    secondAccount.sum += sum;
  }

  // вывод в консоль специального номера счета для "эмиссии"
  public getEmissAccountNumber(): string {
    console.log(
      `Номер специального счета для "эмиссии": ${this.emissAccount.name}`,
    );
    return this.emissAccount.name;
  }

  // вывод в консоль специального номера счета для "уничтожения"
  public getDestructionAccountNumber(): string {
    console.log(
      `Номер специального счета для "уничтожения": ${this.destructionAccount.name}`,
    );
    return this.destructionAccount.name;
  }

  // осуществление эмисси, по добавлению на счет “эмиссии” указанной суммы
  public addEmission(sum: number): void {
    const emissAccount = this.allAccounts.get(this.emissAccount.name);
    emissAccount.sum += sum;
  }

  // осуществление отправки определенной суммы денег с указанного счета на счет “уничтожения”
  public destructMoney(accountName: string, sum: number): void {
    try {
      const account = this.getAccountAndValidate(accountName, sum);
      if (accountName != this.emissAccount.name) this.emissAccount.sum -= sum;
      account.sum -= sum;
      this.destructionAccount.sum += sum;
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

  // перевод заданной суммы денег между двумя указанными счетами. Вариант с несколькими параметрами.
  public transferMoney(
    fromAccountNumber: string,
    toAccountNumber: string,
    sum: number,
  ): void {
    try {
      this.executTransaction(fromAccountNumber, toAccountNumber, sum);
      console.log(
        `Перевод денежных средств со счета ${fromAccountNumber} на счет ${toAccountNumber} выполнен`,
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  // перевод заданной суммы денег между двумя указанными счетами. Вариант с единственным параметром в формате json.
  public transferMoneyJSON(body: string): void {
    const { fromAccountNumber, toAccountNumber, sum } = JSON.parse(body);
    this.transferMoney(fromAccountNumber, toAccountNumber, sum);
  }

  // получение всех счетов в формате JSON
  public getAllAccounts(): string {
    const allAccounts: Account[] = [];
    for (let account of this.allAccounts.values()) {
      allAccounts.push(account);
    }
    const allAccountsJSON = JSON.stringify(allAccounts);
    console.log(allAccountsJSON);
    return allAccountsJSON;
  }

  // для тестов
  public getAccount(accountNumber: string): Account {
    return this.allAccounts.get(accountNumber);
  }

  // для тестов
  public getAccountBalance(accountNumber: string): number {
    return this.getAccount(accountNumber).sum;
  }

  // для тестов
  public blockAccount(accountNumber: string): void {
    this.getAccount(accountNumber).block = true;
  }
}
