const fs = require('fs');
const yaml = require('js-yaml');
const chai = require('chai');
const expect = chai.expect;
const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
const { hexToU8a, isHex } = require('@polkadot/util');
import { balanceInTokens } from "../src/AccountBalanceMonitor";

chai.config.truncateThreshold = 0;

describe('Accounts YAML', () => {
  const accounts = yaml.load(fs.readFileSync('accounts.yml', 'utf8'));
  
  it('checks that there is at least one account', () => {
    expect(accounts).to.have.length.above(0);
  });

  it('should contain accounts with address and desiredBalance fields', () => {
    accounts.forEach((account) => {
      expect(account).to.have.property('address');
      expect(account).to.have.property('desiredBalance');
    });
  });

  it('account address should be valid', () => {
    accounts.forEach((account) => {
      expect(isValidAddressAddress(account.address)).to.be.true;
    });
  });

  it('desiredBalance should be greater than 0', () => {
    accounts.forEach((account) => {
      expect(account.desiredBalance).to.be.above(0);
    });
  });
});

describe('AccountBalanceMonitor', () => {
  it('convertToTokens', () => {
    expect(balanceInTokens((BigInt('792192724600661047')))).to.equal(792192);
    expect(balanceInTokens((BigInt(0)))).to.equal(0);
  });
});

// Helper functions

// From https://polkadot.js.org/docs/util-crypto/examples/validate-address/
// ToDo: Check if it is complete check for Kusama addresses
function isValidAddressAddress(address) {
  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : decodeAddress(address)
    );

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
