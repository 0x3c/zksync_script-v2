import { privates } from '../libs/getPrivates.js'
import * as zksync from "zksync";
import * as ethers from "ethers";
import * as zksyncWeb from "zksync-web3js";
import { updateWalletStatus } from "../libs/notion.js";

const syncProvider = await zksync.getDefaultProvider('mainnet');
const ethersProvider = await ethers.getDefaultProvider('mainnet')

const zkSyncProvider = new zksyncWeb.Provider('https://mainnet.era.zksync.io');

const ethProvider = ethers.getDefaultProvider('mainnet');


const getNonce = async (privateKeys) => {
    const lists = []
    for (let index = 0; index < privateKeys.length; index++) {
        const privateKey = privateKeys[index];
        const signer = new ethers.Wallet(privateKey, ethersProvider);
        const syncWallet = await zksync.Wallet.fromEthSigner(signer, syncProvider);
        const address = syncWallet.address();

        const zkSyncWallet = new zksyncWeb.Wallet(
            privateKey,
            zkSyncProvider,
            ethProvider
        );
        console.log(`查询中 Querying Address:${address}...`);
        // const syncWalletStatus = await syncWallet.getAccountState();
        // console.log(syncWalletStatus.verified.balances.ETH / 1000000000000000000);
        // const liteBalance= syncWalletStatus.verified?.balances?.ETH !== undefined ? syncWalletStatus.verified.balances.ETH / 1000000000000000000 : 0;
        const [lite, era] = await Promise.all([syncWallet.getNonce(), zkSyncWallet.getNonce()])
        const balance = await syncWallet.getBalance('ETH');
        const liteBalance = Number(syncProvider.tokenSet.formatToken('ETH', balance));
        console.table([{
            address,
            zksync_lite_nonce: lite,
            zksync_era_nonce: era,
            zksync_lite_balance: liteBalance,
        }]);
        await updateWalletStatus(address, lite, era, liteBalance);
        lists.push({
            account: address,
            zksync_lite_nonce: lite,
            zksync_era_nonce: era,
            zksync_lite_balance: liteBalance,
        })
    }
    console.table(lists)
}
getNonce(privates)
