import bitcoin from 'react-native-bitcoinjs-lib'
import bigi from 'bigi'

export default class CounoscoinAddress {
    privateKey = null
    network = null

    counoscoin = {
        messagePrefix: '\x19CounosCoin Signed Message:\n',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x0b,
        scriptHash: 0x32,
        wif: 0xb0
    }

    constructor(privateKey, network) {
        if (!privateKey) throw new Error('Private key is required')
        this.privateKey = privateKey
        this.network = network === 'mainnet' ? this.counoscoin : bitcoin.networks.testnet
    }

    get address() {
        //generate new address
        const keyPair = new bitcoin.ECPair(bigi.fromHex(this.privateKey), undefined, {network: this.network})
        const {address} = bitcoin.payments.p2pkh({pubkey: keyPair.publicKey, network: keyPair.network})
        return address
    }
}
