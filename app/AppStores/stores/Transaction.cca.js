import { BigNumber } from 'bignumber.js'
import Transaction from './Transaction'
import MainStore from '../MainStore'
import constant from '../../commons/constant'

export default class TransactionCCA extends Transaction {
  walletType = 'counoscoin'

  constructor(obj, token = {}, status = 1) {
    super(obj, token, status)
    this.rate = MainStore.appState.rateCCADollar
    this.timeStamp = obj.time
    this.hash = obj.blockhash
    this.from = obj.vin.map(i => i.addr)
    this.to = obj.vout.map(o => o.addr)
    this.tokenName = 'counoscoin'
    this.tokenSymbol = 'CCA'
    this.decimal = 8
    //this.gas = new BigNumber(`${obj.weight}`)
    //this.gasPrice = new BigNumber(`1`)
    //this.gasUsed = new BigNumber(`${obj.weight}`)
    this.status = 1
    this.value = new BigNumber(`0`)
    this.out = obj.vout
    this.inputs = obj.vin
  }

  get value() {
    const { selectedWallet } = MainStore.appState
    const address = this.address ? this.address : selectedWallet.address
    if (this.isSent) {
      let s = new BigNumber(`0`)
      for (let i = 0; i < this.inputs.length; i++) {
        if (address === this.inputs[i].addr) {
          s = s.plus(new BigNumber(`${this.inputs[i].value}`))
        }
      }
      return s
    }
    let r = new BigNumber(`0`)
    for (let i = 0; i < this.out.length; i++) {
      if (address === this.out[i].addr) {
        r = r.plus(new BigNumber(`${this.out[i].value}`))
      }
    }
    return r
  }

  get isSelf() {
    const { selectedWallet } = MainStore.appState
    const address = this.address ? this.address : selectedWallet.address
    let self = true
    for (let i = 0; i < this.from.length; i++) {
      if (this.from[i] !== address) {
        self = false
        break
      }
    }
    if (self) {
      for (let i = 0; i < this.to.length; i++) {
        if (this.to[i] !== address) {
          self = false
          break
        }
      }
    }
    return self
  }

  get isSent() {
    const { selectedWallet } = MainStore.appState
    const address = this.address ? this.address : selectedWallet.address
    let sent = true
    for (let i = 0; i < this.from.length; i++) {
      if (this.from[i] !== address) {
        sent = false
        break
      }
    }
    return sent
  }

  get type() {
    if (this.isSelf) return constant.SELF
    if (this.status === 0) return constant.PENDING
    return this.isSent ? constant.SENT : constant.RECEIVED
  }

  get fee() {
    if (this.status === 1) {
      return this.gasUsed.multipliedBy(this.gasPrice).dividedBy(new BigNumber(`1.0e+8`))
    }
    return this.gas.multipliedBy(this.gasPrice).dividedBy(new BigNumber(`1.0e+8`))
  }

  get feeFormat() {
    const usd = this.fee.times(MainStore.appState.rateCCADollar).toFixed(2)
    let usdStr = `= $${usd}`
    if (usd === '0') {
      usdStr = ''
    }
    return `${this.gasUsed} Satoshi ${usdStr}`
  }

  get balance() {
    return this.value.dividedBy(new BigNumber(`1`))
  }

  get balanceUSD() {
    return this.balance.multipliedBy(this.rate)
  }
}
