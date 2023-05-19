import * as zksync from "zksync-web3js";
import * as ethers from "ethers";
import dotenv from "dotenv";
import cc from "node-console-colors";
import { zksyncEraTransferNumber } from '../../config/index.js'
import { privates } from '../../libs/getPrivates.js'

dotenv.config();

const zkSyncProvider = new zksync.Provider('https://mainnet.era.zksync.io');
const ethProvider = ethers.getDefaultProvider('mainnet');

export async function transfer({
  privateKey,
  amount,
  tokenAddress = zksync.utils.ETH_ADDRESS,
  recipientAddress,
}) {

  const zkSyncWallet = new zksync.Wallet(
    privateKey,
    zkSyncProvider,
    ethProvider
  );

  try {
    const _amount = ethers.utils.parseUnits(amount.toString(), 18);
    const to = recipientAddress ?? zkSyncWallet.address;
    console.log(cc.set("fg_green", `Will transfer from ${zkSyncWallet.address} to ${recipientAddress ?? zkSyncWallet.address} amount ${_amount/Math.pow(10, 18)}`));
    const transfer = await zkSyncWallet.transfer({
      to,
      token: tokenAddress,
      amount: _amount,
    });
    const txs = await transfer.wait();
    console.log(`TransactionHash: ${txs.transactionHash}`);
  } catch (error) {
    console.log("transfer failed...", error);
  }

}

const main = async (privateKeys, amount) => {
  for (let index = 0; index < privateKeys.length; index++) {
    const privateKey = privateKeys[index];
    const num = zksyncEraTransferNumber[0]
    for (let i = 0; i < num; i++) {
      await transfer({
        privateKey,
        amount,
      });
    }
  }
};

main(privates, zksyncEraTransferNumber[1])


export default main;
