import { action } from 'mobx'
import WalletToken from './WalletToken'

export default class WalletTokenCCA extends WalletToken {
  @action fetchTransactions = async (isRefresh = false) => {

  }
}
