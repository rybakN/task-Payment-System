import { PaymentSystem } from './main';

const ps = new PaymentSystem();

ps.getDestructionAccountNumber();
ps.getEmissAccountNumber();
console.log('');

console.log('Отправляем на счет эмиссии 2000');
ps.addEmission(2000);
console.log(
  'Баланс счета эмиссии:',
  ps.getAccountBalance('BY04CBDC36029110100040000000'),
);

console.log('');
console.log('Отправляем со счета эмиссии на счет уничтожения ', 200);
ps.destructMoney('BY04CBDC36029110100040000000', 200);
console.log(
  'Баланс счета эмиссии:',
  ps.getAccountBalance('BY04CBDC36029110100040000000'),
);

console.log('');
console.log('Открываем новый счет');
const newAccount = ps.createNewAccount();

console.log('');
console.log(
  'Отправляем сумму с одного счета на другой (метод с несколькими переменными). В данном случае со счета эмиссии на новый счет, созданный в прошлом шаге.',
);
const emissAccountBalance = ps.getAccountBalance(
  'BY04CBDC36029110100040000000',
);
console.log(
  'Начальный баланс счет эмиссии:',
  emissAccountBalance,
  '. Баланс нового счета: ',
  0,
);
ps.transferMoney('BY04CBDC36029110100040000000', newAccount.name, 300);

const newEmissAccountBalance = ps.getAccountBalance(
  'BY04CBDC36029110100040000000',
);
const newAccountBalance = ps.getAccountBalance(newAccount.name);
console.log(
  'Актуальный баланс счет эмиссии:',
  newEmissAccountBalance,
  '. Актуальный баланс нового счета: ',
  newAccountBalance,
);

console.log('');
console.log(
  'Отправляем сумму с одного счета на другой (метод с JSON). В данном случае со счета эмиссии на новый счет, созданный в прошлом шаге.',
);
ps.getAccountBalance('BY04CBDC36029110100040000000');
console.log(
  'Начальный баланс счет эмиссии:',
  emissAccountBalance,
  '. Баланс нового счета: ',
  ps.getAccountBalance(newAccount.name),
);
ps.transferMoneyJSON(
  `{"fromAccountNumber":"BY04CBDC36029110100040000000","toAccountNumber":"${newAccount.name}","sum":200}`,
);
console.log(
  'Актуальный баланс счет эмиссии:',
  ps.getAccountBalance('BY04CBDC36029110100040000000'),
  '. Актуальный баланс нового счета: ',
  ps.getAccountBalance(newAccount.name),
);

console.log('');
console.log('Получение всех аккаунтов в формате JSON');
ps.getAllAccounts();

console.log('');
console.log('Нестандартные ситуации.');
console.log('Счет не существует.');
ps.transferMoney('11', '22', 45);

console.log('');
console.log('Недостаточно средств.');
ps.transferMoneyJSON(
  `{"fromAccountNumber":"BY04CBDC36029110100040000000","toAccountNumber":"${newAccount.name}","sum":100000}`,
);

console.log('');
console.log('Счет заблокирован.');
ps.blockAccount(newAccount.name);
ps.transferMoneyJSON(
  `{"fromAccountNumber":"BY04CBDC36029110100040000000","toAccountNumber":"${newAccount.name}","sum":10}`,
);
