/* eslint-disable */

import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import stripHexPrefix from "strip-hex-prefix";
import EthereumTx from "ethereumjs-tx";

const allowedHdPaths = ["44'/60'", "44'/61'"];

function makeError(msg, id) {
  const err = new Error(msg);
  // $FlowFixMe
  err.id = id;
  return err;
}

function obtainPathComponentsFromDerivationPath(derivationPath) {
  // check if derivation path follows 44'/60'/x'/n pattern
  const regExp = /^(44'\/6[0|1]'\/\d+'\/\d+?\/)(\d+)$/;
  const matchResult = regExp.exec(derivationPath);
  if (matchResult === null) {
    throw makeError(
      "To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/x/n ",
      "InvalidDerivationPath"
    );
  }
  return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
}

function TrezorConnectGetAccounts(path) {
  return new Promise((resolve, reject) => {
    global.TrezorConnect.ethereumGetAddress(path, (result) => {
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.error));
      }
    });
  });
}

function TrezorConnectSignMessage(path, message) {
  return new Promise((resolve, reject) => {
    global.TrezorConnect.ethereumSignMessage(path, message, (result) => {
      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.error));
      }
    }, '1.5.1');
  });
}

const defaultOptions = {
  networkId: 1, // mainnet
  path: "44'/60'/0'/0/0", // ledger default derivation path
  accountsLength: 1,
  accountsOffset: 0
};

/**
 * Create a HookedWalletSubprovider for Ledger devices.
 * @param getTransport gets lazily called each time the device is needed. It is a function that returns a Transport instance. You can typically give `()=>TransportU2F.create()`
 * @example
import Web3 from "web3";
import createLedgerSubprovider from "@ledgerhq/web3-subprovider";
import TransportU2F from "@ledgerhq/hw-transport-u2f";
import ProviderEngine from "web3-provider-engine";
import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
const engine = new ProviderEngine();
const getTransport = () => TransportU2F.create();
const ledger = createLedgerSubprovider(getTransport, {
  accountsLength: 5
});
engine.addProvider(ledger);
engine.addProvider(new RpcSubprovider({ rpcUrl }));
engine.start();
const web3 = new Web3(engine);
 */
export default function createTrezorSubprovider(options) {
  const { networkId, path, askConfirm, accountsLength, accountsOffset } = {
    ...defaultOptions,
    ...options
  };
  if (!allowedHdPaths.some(hdPref => path.startsWith(hdPref))) {
    throw makeError(
      "Ledger derivation path allowed are " +
        allowedHdPaths.join(", ") +
        ". " +
        path +
        " is not supported",
      "InvalidDerivationPath"
    );
  }

  const pathComponents = obtainPathComponentsFromDerivationPath(path);

  const addressToPathMap = {};
  const addressCache = {};

  async function getAccounts() {
    const addresses = {};
    for (let i = accountsOffset; i < accountsOffset + accountsLength; i++) {
      const path =
        pathComponents.basePath + (pathComponents.index + i).toString();
      if (addressCache[path]) {
        addresses[path] = addressCache[path];
        continue;
      }
      const address = await TrezorConnectGetAccounts(path);
      addresses[path] = `0x${address.address}`;
      addressCache[path] = addresses[path];
      addressToPathMap[`0x${address.address}`.toLowerCase()] = path;
    }
    return addresses;
  }

  async function signPersonalMessage(msgData) {
    console.log(msgData);
    const path = addressToPathMap[msgData.from.toLowerCase()];
    if (!path) throw new Error("address unknown '" + msgData.from + "'");
      const result = await TrezorConnectSignMessage(
        path,
        stripHexPrefix(msgData.data)
      );
      console.log(result);
      const v = parseInt(result.v, 10) - 27;
      let vHex = v.toString(16);
      if (vHex.length < 2) {
        vHex = `0${v}`;
      }
      return `0x${result.r}${result.s}${vHex}`;
  }

  async function signTransaction(txData) {
    console.log(txData);
    const path = addressToPathMap[txData.from.toLowerCase()];
    if (!path) throw new Error("address unknown '" + txData.from + "'");
    const transport = await getTransport();
    try {
      const eth = new AppEth(transport);
      const tx = new EthereumTx(txData);
      console.log(txData);

      // Set the EIP155 bits
      tx.raw[6] = Buffer.from([networkId]); // v
      tx.raw[7] = Buffer.from([]); // r
      tx.raw[8] = Buffer.from([]); // s

      // Pass hex-rlp to ledger for signing
      const result = await eth.signTransaction(
        path,
        tx.serialize().toString("hex")
      );

      // Store signature in transaction
      tx.v = Buffer.from(result.v, "hex");
      tx.r = Buffer.from(result.r, "hex");
      tx.s = Buffer.from(result.s, "hex");

      // EIP155: v should be chain_id * 2 + {35, 36}
      const signedChainId = Math.floor((tx.v[0] - 35) / 2);
      const validChainId = networkId & 0xff; // FIXME this is to fixed a current workaround that app don't support > 0xff
      if (signedChainId !== validChainId) {
        throw makeError(
          "Invalid networkId signature returned. Expected: " +
            networkId +
            ", Got: " +
            signedChainId,
          "InvalidNetworkId"
        );
      }

      return `0x${tx.serialize().toString("hex")}`;
    } finally {
      transport.close();
    }
  }

  const subprovider = new HookedWalletSubprovider({
    getAccounts: callback => {
      getAccounts()
        .then(res => callback(null, Object.values(res)))
        .catch(err => callback(err, null));
    },
    signPersonalMessage: (txData, callback) => {
      signPersonalMessage(txData)
        .then(res => callback(null, res))
        .catch(err => callback(err, null));
    },
    signTransaction: (txData, callback) => {
      signTransaction(txData)
        .then(res => callback(null, res))
        .catch(err => callback(err, null));
    }
  });

  return subprovider;
}
