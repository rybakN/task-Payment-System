import { IBAN, CountryCode } from 'ibankit';

type Account = {
  name: string;
  sum: number;
  block: boolean;
};

interface IPaymentSystem {
  getEmissAccountNum(): string;
  getDestructionAccountNum(): string;
  emissAddSum(sum: number): Account;
  destructionMoney(accountName: string, sum: number): Account;
  createNewAccount(): Account;
  transferMoney(
    firstAccount?: string,
    secondAccount?: string,
    sum?: number,
    body?: string,
  ): Account[];
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

  private validateAccount(accountName: string, sum?: number): Account {
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
  ): Account[] {
    const firstAccount = this.validateAccount(firstAccountName, sum);
    const secondAccount = this.validateAccount(secondAccountName, sum);

    firstAccount.sum -= sum;
    secondAccount.sum += sum;

    return [firstAccount, secondAccount];
  }

  // вывод в консоль специального номера счета для "эмиссии"
  public getEmissAccountNum(): string {
    console.log(
      `Номер специального счета для "эмиссии": ${this.emissAccount.name}`,
    );
    return this.emissAccount.name;
  }

  // вывод в консоль специального номера счета для "уничтожения"
  public getDestructionAccountNum(): string {
    console.log(
      `Номер специального счета для "уничтожения": ${this.destructionAccount.name}`,
    );
    return this.destructionAccount.name;
  }

  // осуществление эмисси, по добавлению на счет “эмиссии” указанной суммы
  public emissAddSum(sum: number): Account {
    const emissAccount = this.allAccounts.get(this.emissAccount.name);
    emissAccount.sum += sum;
    return emissAccount;
  }

  // осуществление отправки определенной суммы денег с указанного счета на счет “уничтожения”
  public destructionMoney(accountName: string, sum: number): Account {
    try {
      const account = this.validateAccount(accountName, sum);
      if (accountName != this.emissAccount.name) this.emissAccount.sum -= sum;
      account.sum -= sum;
      return account;
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
  ): Account[] {
    const argLength = arguments.length;
    if (argLength != 1 && argLength != 3) {
      console.log('Не верные параметры');
      return;
    }

    if (argLength === 3) {
      try {
        const accounts = this.executTransaction(
          firstAccount!,
          secondAccount!,
          sum!,
        );
        console.log(
          `Перевод денежных средств со счета ${firstAccount} на счет ${secondAccount} выполнен`,
        );
        return accounts;
      } catch (error) {
        console.log(error.message);
      }
    }

    if (argLength === 1) {
      const { firstAccount, secondAccount, sum } = JSON.parse(body!);
      try {
        const accounts = this.executTransaction(
          firstAccount!,
          secondAccount!,
          sum!,
        );
        console.log(
          `Перевод денежных средств со счета ${firstAccount} на счет ${secondAccount} выполнен`,
        );
        return accounts;
      } catch (error) {
        console.log(error.message);
      }
    }
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
}

const ps = new PaymentSystem(); // создание экземпляра класса платежной системы
ps.getDestructionAccountNum();
ps.getEmissAccountNum();
console.log(ps.emissAddSum(300));
console.log(ps.destructionMoney('BY04CBDC36029110100040000000', 200));
for (let i = 0; i < 3; i++) ps.createNewAccount();
ps.getAllAccounts();
ps.transferMoney('11', '22', 45);
ps.destructionMoney('23', 900);
