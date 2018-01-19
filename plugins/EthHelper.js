import EthHelper from '@/util/EthHelper';
import * as types from '@/store/mutation-types';

const web3Error = 'Like function will not work without a wallet, is '
  + '<a href="https://metamask.io/" href="https://wallet.metamask.io/"> Metamask </a> installed?';
const testnetError = 'You are in wrong ETH network, please switch to testnet '
  + '<a href="https://www.rinkeby.io/" href="https://wallet.metamask.io/"> Rinkeby </a> in metamask.';
const lockedError = 'Cannot obtain your ETH wallet, please make sure it is UNLOCKED.';
const netTestnetError = 'You are in wrong ETH network, please switch to testnet '
                        + '<a href="https://www.rinkeby.io/" href="https://wallet.metamask.io/"> Rinkeby </a> '
                        + 'in <a href="https://wallet.metamask.io/" href="https://wallet.metamask.io/">https://wallet.metamask.io.';
const netLockedError = 'Cannot obtain your ETH wallet.'
                        + '<br/> Please make sure you have registered one in'
                        + '<a href="https://wallet.metamask.io/" target="_blank">https://wallet.metamask.io</a> and UNLOCKED it'
                        + '<br/> or install the <a href="https://metamask.io/" target="_blank">Metamask extension</a>.';

export default ({ store }) => {
  EthHelper.initApp(
    (err) => {
      let errMsg = '';
      if (err === 'web3') errMsg = web3Error;
      else if (err === 'testnet') errMsg = EthHelper.getIsMetaMask() ? testnetError : netTestnetError;
      else if (err === 'locked') errMsg = EthHelper.getIsMetaMask() ? lockedError : netLockedError;
      store.commit(types.UI_POPUP_ERR, errMsg);
    },
    () => {
      store.commit(types.UI_POPUP_ERR, '');
    },
    (wallet) => {
      store.dispatch('setLocalWallet', wallet);
      store.dispatch('isUser', wallet);
    },
  );
};
