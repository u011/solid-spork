import { ApiPromise, WsProvider } from '@polkadot/api';
import '@polkadot/api-augment';
import yaml from 'js-yaml';
import fs from 'fs';
import { Gauge, Counter } from 'prom-client';
import { AccountInfo, Balance } from '@polkadot/types/interfaces';

export default async function observeAccountBalance(kusamaQueryNode: string) {
  return observe(kusamaQueryNode).catch(console.error);
}

// Data representation of the accounts.yml file
interface Account {
  readonly address: string;
  readonly desiredBalance: number;
}

// Prometheus metrics
const lastBlockHeight = new Gauge({
  name: 'last_block_height',
  help: 'to relate account balance to block height'
});

const accountBalanceCurrent = new Gauge({
  name: 'account_balance_current_tokens',
  help: 'tracking acccount balance',
  labelNames: ['address'] as const
});

const accountBalanceDesired = new Gauge({
  name: 'account_balance_desired_tokens',
  help: 'to alert when account balance is below desired',
  labelNames: ['address'] as const
});

const measureAndRecordErrorCounter = new Counter({
  name: 'measure_and_record_error_counter',
  help: 'to track errors'
});

// Query the chain and update the metrics
async function observe(kusamaQueryNode: string) {
  const provider = new WsProvider(kusamaQueryNode);
  const api = await ApiPromise.create({ provider });
  const accounts = yaml.load(fs.readFileSync('accounts.yml', 'utf8')) as Account[];

  // Record desired balance for each account
  for (const account of accounts) {
    accountBalanceDesired.labels(account.address).set(account.desiredBalance);
  }

  // On every new block, update the account balances
  api.rpc.chain.subscribeNewHeads(async (header) => {
    try {
      await measureAndRecord(header, api, accounts);
    } catch (error) {
      measureAndRecordErrorCounter.inc();
      console.error(error);
    };
  });
};

// Query the chain and update the metrics
async function measureAndRecord(header, api, accounts: Account[]) {
  lastBlockHeight.set(header.number.toNumber());

  for (const account of accounts) {
    const object: AccountInfo = await api.query.system.account(account.address);
    const free: Balance = object.data.free;
    const balance = balanceInTokens(free.toBigInt());
    accountBalanceCurrent.labels(account.address).set(balance);
  }
};

// Helper function, api.query.system.account.data.free is in picotokens
export function balanceInTokens(picotokens: bigint): number {
  return Number(picotokens / BigInt(1.0e+12));
};