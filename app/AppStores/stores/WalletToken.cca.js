import {action} from 'mobx'
import WalletToken from './WalletToken'
import appState from "../AppState";
import API from "../../api";
import Transaction from "./Transaction";
import TransactionCCA from "./Transaction.cca";

export default class WalletTokenCCA extends WalletToken {
    @action fetchTransactions = async (isRefresh = false) => {
        if (this.isLoading || this.isRefreshing || (!isRefresh && !this.txFetcherInfo.hasMoreData)) return
        if (isRefresh) {
            this.txFetcherInfo = {
                ...this.txFetcherInfo,
                isRefreshing: true,
                hasMoreData: true,
                page: 1
            }
        } else {
            this.txFetcherInfo.isLoading = true
        }

        let data = {}

        const {address} = appState.selectedWallet

        if (address === this.address) {
            data = {
                module: 'account',
                action: 'txlist',
                address,
                startblock: 0,
                sort: 'desc',
                endblock: 99999999,
                offset: 16,
                apikey: 'SVUJNQSR2APDFX89JJ1VKQU4TKMB6W756M'
            }
        } else {
            data = {
                module: 'account',
                action: 'tokentx',
                address,
                contractaddress: this.address,
                offset: 16,
                sort: 'desc',
                symbol: this.title
            }
        }
        //TODO hard code
        //API.fetchCCATransactions('5mCf7itPw3SFuW9DjbMTc2hR6vYFWD2N4i', data, this.txFetcherInfo.page).then((res) => {
        API.fetchCCATransactions(this.address, data, this.txFetcherInfo.page).then((res) => {
            let txArr = res.data.txs.map(t => new TransactionCCA(t, this)).reduce((_result, _tx) => {
                //console.log(_result, _tx);
                const result = _result
                const tx = _tx
                tx.isSelf = !!result[tx.hash]
                result[tx.hash] = tx
                return result
            }, {})
            console.log(txArr);
            txArr = Object.keys(txArr).map(s => txArr[s])
            console.log(txArr);
            if (this.txFetcherInfo.page === 1) {
                this.transactions = txArr
            } else {
                this.transactions = [...this.transactions.slice(), ...txArr]
            }
            this.offLoading(true, this.txFetcherInfo.page + 1)
        }).catch((_) => {
            console.log(_);
            this.offLoading(false, this.txFetcherInfo.page)
        })
    }
}
