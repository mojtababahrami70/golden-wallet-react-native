import EthereumAddress from './Ethereum'
import BitcoinAddress from './Bitcoin'
import CounoscoinAddress from "./Counoscoin";

export const chainNames = {
  ETH: 'Ethereum',
  CCA: 'CounosCoin',
  BTC: 'Bitcoin'
}

export default (privateKey, chainName = 'Ethereum', network = 'mainnet') => {
  switch (chainName) {
    case chainNames.ETH:
      return new EthereumAddress(privateKey)
    case chainNames.BTC:
      return new BitcoinAddress(privateKey, network)
    case chainNames.CCA:
      return new CounoscoinAddress(privateKey, network)
    default: return new EthereumAddress(privateKey)
  }
}
