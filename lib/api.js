const fastSha256 = require('fast-sha256');
const secp256k1 = require('eccrypto-sync/secp256k1');
const base64 = require('./base64');
const base58 = require('./base58');

module.exports = ({random, fetch, Headers, encodeUtf8, crdsUrl}) => {

const NULL_PRIVATE_KEY = (() => {
  const result = new Uint8Array(32);
  result[0] = 0xFF;
  return result;
})();
// const NULL_PUBLIC_KEY = eccrypto.getPublic(NULL_PRIVATE_KEY);

const _getPublicKey = privateKey => Uint8Array.from(secp256k1.keyFromPrivate(privateKey).getPublic('arr'));
const getAddress = privateKey => base58.encode(_sha256(_getPublicKey(privateKey)));
const _getProxyUrl = proxy => proxy ? '/crds' : crdsUrl;
const requestStatus = ({proxy = false} = {}) => fetch(`${_getProxyUrl(proxy)}/status`)
  .then(_resJson);
const requestBlockCache = ({proxy = false} = {}) => fetch(`${_getProxyUrl(proxy)}/blockcache`)
  .then(_resJson);
const requestUnconfirmedBalances = (address, {proxy = false} = {}) => fetch(`${_getProxyUrl(proxy)}/unconfirmedBalances/${encodeURIComponent(address)}`)
  .then(_resJson);
const requestUnconfirmedPrice = (asset, {proxy = false} = {}) => fetch(`${_getProxyUrl(proxy)}/unconfirmedPrice/${encodeURIComponent(asset)}`)
  .then(_resJson);
const requestMempool = ({proxy = false} = {}) => fetch(`${_getProxyUrl(proxy)}/mempool`)
  .then(_resJson);
const _requestSubmitMessage = (message, {proxy = false} = {}) => fetch(`${_getProxyUrl(proxy)}/submitMessage`, {
    method: 'POST',
    headers: (() => {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return headers;
    })(),
    body: JSON.stringify(message),
  })
  .then(_resJson);
const requestCreateSend = (asset, quantity, srcAddress, dstAddress, privateKey, {proxy = false} = {}) => requestStatus({proxy})
  .then(status => {
    const {startHeight, timestamp} = status;
    const privateKeyBuffer = base64.decode(privateKey);
    const publicKey = _getPublicKey(privateKeyBuffer);
    const publicKeyString = base64.encode(publicKey);
    const payload = JSON.stringify({type: 'send', startHeight, asset, quantity, srcAddress, dstAddress, publicKey: publicKeyString, timestamp});
    const payloadHash = _sha256(payload);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, privateKeyBuffer).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreateMinter = (asset, privateKey, {proxy = false} = {}) => requestStatus()
  .then(status => {
    const {startHeight, timestamp} = status;
    const privateKeyBuffer = base64.decode(privateKey);
    const publicKey = _getPublicKey(privateKeyBuffer);
    const publicKeyString = base64.encode(publicKey);
    const payload = JSON.stringify({type: 'minter', asset, publicKey: publicKeyString, startHeight, timestamp});
    const payloadBuffer = new TextEncoder('utf-8').encode(payload);
    const payloadHash = _sha256(payloadBuffer);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, privateKeyBuffer).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreateMint = (asset, quantity, privateKey, {proxy = false} = {}) => requestStatus()
  .then(status => {
    const {startHeight, timestamp} = status;
    const privateKeyBuffer = base64.decode(privateKey);
    const publicKey = _getPublicKey(privateKeyBuffer);
    const publicKeyString = base64.encode(publicKey);
    const payload = JSON.stringify({type: 'mint', asset, quantity, publicKey: publicKeyString, startHeight, timestamp});
    const payloadHash = _sha256(payload);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, privateKeyBuffer).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreateGet = (address, asset, quantity, {proxy = false} = {}) => requestStatus()
  .then(status => {
    const {startHeight, timestamp} = status;
    const payload = JSON.stringify({type: 'get', address, asset, quantity, startHeight, timestamp});
    const payloadHash = _sha256(payload);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, NULL_PRIVATE_KEY).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreateBurn = (asset, quantity, privateKey, {proxy = false} = {}) => requestStatus()
  .then(status => {
    const {startHeight, timestamp} = status;
    const privateKeyBuffer = base64.decode(privateKey);
    const publicKey = _getPublicKey(privateKeyBuffer);
    const publicKeyString = base64.encode(publicKey);
    const payload = JSON.stringify({type: 'burn', asset, quantity, publicKey: publicKeyString, startHeight, timestamp});
    const payloadHash = _sha256(payload);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, privateKeyBuffer).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreateDrop = (address, asset, quantity, {proxy = false} = {}) => requestStatus()
  .then(status => {
    const {startHeight, timestamp} = status;
    const payload = JSON.stringify({type: 'drop', address, asset, quantity, startHeight, timestamp});
    const payloadHash = _sha256(payload);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, NULL_PRIVATE_KEY).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreatePrice = (asset, price, privateKey, {proxy = false} = {}) => requestStatus({proxy})
  .then(status => {
    const {startHeight, timestamp} = status;
    const privateKeyBuffer = base64.decode(privateKey);
    const publicKey = _getPublicKey(privateKeyBuffer);
    const publicKeyString = base64.encode(publicKey);
    const payload = JSON.stringify({type: 'price', asset, price, publicKey: publicKeyString, startHeight, timestamp});
    const payloadBuffer = new TextEncoder('utf-8').encode(payload);
    const payloadHash = _sha256(payloadBuffer);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, privateKeyBuffer).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });
const requestCreateBuy = (asset, quantity, price, privateKey, {proxy = false} = {}) => requestStatus({proxy})
  .then(status => {
    const {startHeight, timestamp} = status;
    const privateKeyBuffer = base64.decode(privateKey);
    const publicKey = _getPublicKey(privateKeyBuffer);
    const publicKeyString = base64.encode(publicKey);
    const payload = JSON.stringify({type: 'buy', asset, quantity, price, publicKey: publicKeyString, startHeight, timestamp});
    const payloadBuffer = new TextEncoder('utf-8').encode(payload);
    const payloadHash = _sha256(payloadBuffer);
    const payloadHashString = _arrayToHex(payloadHash);
    const signature = Uint8Array.from(secp256k1.sign(payloadHash, privateKeyBuffer).toDER());
    const signatureString = base64.encode(signature);
    const message = {
      payload: payload,
      hash: payloadHashString,
      signature: signatureString,
    };

    return _requestSubmitMessage(message, {proxy});
  });

const _resJson = res => {
  if (res.status >= 200 && res.status < 300) {
    return res.json();
  } else {
    return Promise.reject({
      status: res.status,
      stack: 'API returned failure status code: ' + res.status,
    });
  }
};
const _arrayToHex = array => {
  let result = '';
  for (let i = 0; i < array.byteLength; i++) {
    const n = array[i];
    result += ('00' + n.toString(16)).slice(-2);
  }
  return result;
};
const _sha256 = o => {
  if (typeof o === 'string') {
    o = encodeUtf8(o);
  }
  return fastSha256(o);
};

return {
  getAddress,
  requestStatus,
  requestBlockCache,
  requestUnconfirmedBalances,
  requestUnconfirmedPrice,
  requestMempool,
  requestCreateSend,
  requestCreateMinter,
  requestCreateMint,
  requestCreateGet,
  requestCreateBurn,
  requestCreateDrop,
  requestCreatePrice,
  requestCreateBuy,
};

};
