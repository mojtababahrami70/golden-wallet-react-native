import { observable, action, computed } from 'mobx'
import BigNumber from 'bignumber.js'
import Wallet from './Wallet'
import Keystore from '../../../../Libs/react-native-golden-keystore'
import api from '../../../api'
import MainStore from '../../MainStore'
import WalletTokenCCA from '../WalletToken.cca'
import TransactionCCA from '../Transaction.cca'
import GetAddress, { chainNames } from '../../../Utils/WalletAddresses'

const defaultObjWallet = {
  title: '',
  address: '',
  balance: '0',
  type: 'counoscoin',
  path: Keystore.CoinType.CCA.path,
  external: false,
  didBackup: true,
  index: 0,
  isCold: false,
  canSendTransaction: true,
  nonce: 1
}
export default class WalletCCA extends Wallet {
  path = Keystore.CoinType.CCA.path
  type = 'counoscoin'
  @observable isFetchingBalance = false
  @observable totalBalance = new BigNumber('0')
  @observable isHideValue = false
  @observable enableNotification = true
  @observable isRefresh = false

  constructor(obj, secureDS) {
    super(obj, secureDS)
      console.log(this.path)
    this.secureDS = secureDS
    const initObj = Object.assign({}, defaultObjWallet, obj) // copy
    this._validateData(initObj)

    Object.keys(initObj).forEach((k) => {
      if (k === 'balance') initObj[k] = new BigNumber(initObj.balance)
      if (k === 'totalBalance') initObj[k] = new BigNumber(initObj.totalBalance)
      if (k === 'address') initObj[k] = initObj.address

      this[k] = initObj[k]
    })
    this.tokens = [this.getTokenCCA()]
  }

  @action offLoading() {
    this.isFetchingBalance = false
    this.isRefresh = false
    this.loading = false
  }

  @action async fetchingBalance(isRefresh = false, isBackground = false) {
    if (this.loading) return

    this.loading = true
    this.isRefresh = isRefresh
    this.isFetchingBalance = !isRefresh && !isBackground
    try {
      const res = await api.fetchWalletCCAInfo(this.address)
      if (res.status !== 200) {
        this.balance = new BigNumber(`0`)
        this.totalBalance = this.balance
      } else if (res.data) {
        this.balance = new BigNumber(`${res.data.balanceSat}`)
        this.totalBalance = this.balance.times(new BigNumber('1e-8'))
      } else {
        this.balance = new BigNumber(`0`)
        this.totalBalance = this.balance
      }
      this.tokens = [this.getTokenCCA()]
      this.tokens[0].transactions = res.data.transactions.map(tx => new TransactionCCA(tx, 1))
      this.update()
      this.offLoading()
    } catch (e) {
      this.offLoading()
    }
  }

  @action async implementPrivateKey(secureDS, privateKey, coin = chainNames.CCA) {
    this.canSendTransaction = true
    this.importType = 'Private Key'
    const { address } = GetAddress(privateKey, coin)
    if (coin === chainNames.CCA && address !== this.address) {
      throw new Error('Invalid Private Key')
    }
    secureDS.savePrivateKey(this.address, privateKey)
  }

  @computed get totalBalanceDollar() {
    const rate = MainStore.appState.rateCCADollar
    return this.totalBalanceETH.multipliedBy(rate)
  }

  getTokenCCA() {
    const tokenCCA = {
      tokenInfo: {
        address: this.address,
        name: 'Counoscoin',
        symbol: 'CCA',
        decimals: 8,
        price: {
          rate: MainStore.appState.rateCCADollar.toString(10)
        }
      },
      balance: this.balance.toString(10)
    }

    return new WalletTokenCCA(tokenCCA, this.address)
  }
}
