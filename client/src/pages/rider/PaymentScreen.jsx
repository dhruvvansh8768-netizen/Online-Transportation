import React, { useState } from 'react';
import {
  Wallet, CreditCard, Smartphone, Landmark, Banknote, Plus,
  CheckCircle2, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/helpers';

const INITIAL_METHODS = [
  { id: 1, mode: 'UPI', detail: 'rahul.patel@okicici', isDefault: true, icon: Smartphone },
  { id: 2, mode: 'Google Pay', detail: '+91 98765 00005', isDefault: false, icon: Smartphone },
  { id: 3, mode: 'PhonePe', detail: '9876500005@ybl', isDefault: false, icon: Smartphone },
  { id: 4, mode: 'Paytm', detail: 'Paytm Wallet Linked', isDefault: false, icon: Wallet },
  { id: 5, mode: 'Credit Card', detail: 'HDFC Visa •••• 4829', isDefault: false, icon: CreditCard },
  { id: 6, mode: 'Debit Card', detail: 'SBI RuPay •••• 9104', isDefault: false, icon: CreditCard },
  { id: 7, mode: 'Net Banking', detail: 'ICICI Corporate / Retail', isDefault: false, icon: Landmark },
  { id: 8, mode: 'Cash', detail: 'Pay directly after ride', isDefault: false, icon: Banknote },
];

const TRANSACTIONS = [
  { id: 'TXN-901', title: 'MG Road to Ahmedabad Airport', mode: 'UPI', amount: -215, date: '01 Aug 2026', type: 'debit' },
  { id: 'TXN-902', title: 'Wallet Top-up via Net Banking', mode: 'Net Banking', amount: 500, date: '30 Jul 2026', type: 'credit' },
  { id: 'TXN-903', title: 'Vastrapur to Prahladnagar', mode: 'Google Pay', amount: -140, date: '28 Jul 2026', type: 'debit' },
];

/**
 * PaymentScreen — Wallet top-up, all 8 payment modes from Lab-3, and transaction ledger
 */
const PaymentScreen = () => {
  const [walletBalance, setWalletBalance] = useState(480);
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [topupOpen, setTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(200);

  const handleSetDefault = (id) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleTopup = () => {
    setWalletBalance((b) => b + Number(topupAmount || 0));
    setTopupOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Wallet Hero Card */}
        <div className="bg-gradient-to-br from-navy-800 via-navy-700 to-navy-800 border border-accent/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <p className="text-xs uppercase tracking-wider text-accent font-semibold">RideGo Wallet Balance</p>
            <h1 className="text-3xl font-bold text-white mt-1">{formatCurrency(walletBalance)}</h1>
            <p className="text-xs text-gray-400 mt-1">Instant zero-fee checkouts on every ride</p>
          </div>
          <Button icon={Plus} onClick={() => setTopupOpen(true)}>
            Add Money
          </Button>
        </div>

        {/* Supported Payment Modes (Matches Lab-3 PAYMENT table) */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Payment Modes</h2>
            <span className="text-xs text-gray-400">Tap to set default</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handleSetDefault(method.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    method.isDefault
                      ? 'border-accent bg-accent/10'
                      : 'border-white/10 bg-navy-900/60 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      method.isDefault ? 'bg-accent text-navy-900' : 'bg-white/5 text-gray-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{method.mode}</p>
                      <p className="text-xs text-gray-400 truncate">{method.detail}</p>
                    </div>
                  </div>
                  {method.isDefault && <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <div className="divide-y divide-white/5">
            {TRANSACTIONS.map((txn) => (
              <div key={txn.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    txn.type === 'credit' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {txn.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{txn.title}</p>
                    <p className="text-xs text-gray-400">{txn.date} • {txn.mode}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${txn.type === 'credit' ? 'text-green-400' : 'text-white'}`}>
                  {txn.type === 'credit' ? `+${formatCurrency(txn.amount)}` : formatCurrency(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={topupOpen} onClose={() => setTopupOpen(false)} title="Add Money to Wallet" size="sm">
        <div className="space-y-4">
          <div className="flex gap-2">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => setTopupAmount(amt)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                  topupAmount === amt
                    ? 'bg-accent text-navy-900 border-accent'
                    : 'bg-navy-900 text-gray-300 border-white/10'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            className="w-full bg-navy-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
          />
          <Button fullWidth onClick={handleTopup}>
            Proceed to Add {formatCurrency(topupAmount)}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentScreen;

