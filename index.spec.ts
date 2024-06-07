import { PaymentSystem } from './main';

describe('Payment System', () => {
  const ps = new PaymentSystem();
  const emissAccountNumber = ps.getEmissAccountNumber();
  const destructionAccountNumber = ps.getDestructionAccountNumber();
  const newAccount = ps.createNewAccount();

  it('Check emiss account number', () => {
    expect(emissAccountNumber === ps.getAccount(emissAccountNumber).name).toBe(
      true,
    );
  });

  it('Check destruction account number', () => {
    expect(
      destructionAccountNumber === ps.getAccount(destructionAccountNumber).name,
    ).toBe(true);
  });

  it('Check emission', () => {
    const emissSum = 2000;
    const emissionBalance = ps.getAccountBalance(emissAccountNumber);
    ps.addEmission(emissSum);
    const newEmissionBalance = ps.getAccountBalance(emissAccountNumber);

    expect(newEmissionBalance - emissionBalance).toBe(emissSum);
  });

  it('Check destruction', () => {
    const destructSum = 500;
    const emissionBalance = ps.getAccountBalance(emissAccountNumber);
    ps.destructMoney(emissAccountNumber, destructSum);
    const newEmissionBalance = ps.getAccountBalance(emissAccountNumber);

    expect(emissionBalance - newEmissionBalance).toBe(destructSum);
  });

  it('Check created account', () => {
    const findedNewAccount = ps.getAccount(newAccount.name);

    expect(newAccount.name === findedNewAccount.name).toBe(true);
  });

  it('Check transfer money', () => {
    const transferSum = 300;
    const newAccountBalance = newAccount.sum;
    const emissAccountBalance = ps.getAccountBalance(emissAccountNumber);

    ps.transferMoney(emissAccountNumber, newAccount.name, transferSum);

    const newEmissAccountBalance = ps.getAccountBalance(emissAccountNumber);
    const newAccountBalanceAfterTransfer = ps.getAccountBalance(
      newAccount.name,
    );

    expect(
      emissAccountBalance - newEmissAccountBalance === transferSum &&
        newAccountBalanceAfterTransfer - newAccountBalance === transferSum,
    ).toBe(true);
  });

  it('Check transfer money. JSON.', () => {
    const transferSum = 300;
    const newAccountBalance = newAccount.sum;
    const emissAccountBalance = ps.getAccountBalance(emissAccountNumber);
    const body = {
      fromAccountNumber: emissAccountNumber,
      toAccountNumber: newAccount.name,
      sum: transferSum,
    };

    ps.transferMoneyJSON(JSON.stringify(body));

    const newEmissAccountBalance = ps.getAccountBalance(emissAccountNumber);
    const newAccountBalanceAfterTransfer = ps.getAccountBalance(
      newAccount.name,
    );

    expect(
      emissAccountBalance - newEmissAccountBalance === transferSum &&
        newAccountBalanceAfterTransfer - newAccountBalance === transferSum,
    ).toBe(true);
  });

  it('Check JSON format in method getAllAccount', () => {
    const allAccounts = ps.getAllAccounts();
    expect(!!JSON.parse(allAccounts)).toBe(true);
  });
});
