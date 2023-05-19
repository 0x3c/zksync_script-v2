import * as zksync from "zksync";
import * as ethers from "ethers";
import cc from "node-console-colors";
import { privates } from '../../libs/getPrivates.js'
import { zksyncLiteTransferNumber } from '../../config/index.js'


export const transfer = async ({ privateKey, amount, tokenSymbol = 'ETH', recipientAddress }) => {

    let syncWallet;
    try {
        const syncProvider = await zksync.getDefaultProvider('mainnet');
        const ethersProvider = await ethers.getDefaultProvider('mainnet')
        const signer = new ethers.Wallet(privateKey, ethersProvider);
        syncWallet = await zksync.Wallet.fromEthSigner(signer, syncProvider);
        const accountStatus = await syncWallet.getAccountState();
        if (accountStatus.accountType === null) {
            console.log(cc.set("fg_red", `${syncWallet.address()} 账号被锁定`))
            await syncWallet.setSigningKey({
                feeToken: 'ETH',
                ethAuthType: 'ECDSA'
            });
        }

        const to = recipientAddress ?? syncWallet.address()

        const _amount = ethers.utils.parseUnits(amount.toString(), 18);
        const transfer = await syncWallet.syncTransfer({
            to,
            token: tokenSymbol,
            amount: _amount,
        });

        // Wait for the transaction to be confirmed
        const tx = await transfer.awaitReceipt();
        console.log(tx);
    } catch (error) {
        console.log("transfer failed...", error.toString());
        if (error.toString().includes("Account is locked")) {
            console.log(cc.set("fg_red", "账号被锁定"))
        }
    }
}

export const main = async (privateKeys, amount) => {
    for (let index = 0; index < privateKeys.length; index++) {
        const privateKey = privateKeys[index];
        const num = zksyncLiteTransferNumber[0]
        for (let exponent = 0; exponent < num; exponent++) {
            await transfer({
                privateKey,
                amount
            })
        }
    }
}

main(privates, zksyncLiteTransferNumber[1]);

export default main;
