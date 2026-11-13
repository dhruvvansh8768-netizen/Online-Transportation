import React, { useState } from 'react';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const TRANSACTIONS = [
  { id: 1, txn: 'TXN-8801', bookingId: 21, customer: 'Aarav Kumar Shah', mode: 'Cash', amount: 185, status: 'Completed', date: '2026-08-01' },
  { id: 2, txn: 'TXN-8802', bookingId: 22, customer: 'Vivaan Raj Patel', mode: 'UPI', amount: 240, status: 'Completed', date: '2026-08-02' },
  { id: 3, txn: 'TXN-8803', bookingId: 23, customer: 'Aditya Kumar Mehta', mode: 'Credit Card', amount: 120, status: 'Refunded', date: '2026-08-03' },
  { id: 4, txn: 'TXN-8804', bookingId: 24, customer: 'Krishna Raj Joshi', mode: 'Debit Card', amount: 210, status: 'Completed', date: '2026-08-04' },
  { id: 5, txn: 'TXN-8805', bookingId: 25, customer: 'Rahul Kumar Verma', mode: 'Google Pay', amount: 165, status: 'Completed', date: '2026-08-05' },
  { id: 6, txn: 'TXN-8806', bookingId: 26, customer: 'Priya Raj Sharma', mode: 'PhonePe', amount: 290, status: 'Completed', date: '2026-08-06' },
];

/**
 * PaymentManagement — Transaction logs and payment mode breakdown
 */
const PaymentManagement = () => {
  const [modeFilter, setModeFilter] = useState('All');

  const filtered = TRANSACTIONS.filter((t) => modeFilter === 'All' || t.mode === modeFilter);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-accent" /> Payment & Revenue Logs
            </h1>
            <p className="text-sm text-gray-400">Transactions across UPI, Credit Card, Debit Card, Google Pay, PhonePe, Wallet & Cash</p>
          </div>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-navy-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
          >
            {['All', 'UPI', 'Google Pay', 'PhonePe', 'Credit Card', 'Debit Card', 'Cash'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="bg-navy-800 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy-900/80 text-xs uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">TXN ID</th>
                  <th className="px-5 py-3.5">Booking</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Payment Mode</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-accent">{t.txn}</td>
                    <td className="px-5 py-4 font-mono text-gray-400">#{t.bookingId}</td>
                    <td className="px-5 py-4 text-white font-medium">{t.customer}</td>
                    <td className="px-5 py-4 text-gray-300">{t.mode}</td>
                    <td className="px-5 py-4 text-gray-400">{t.date}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'Completed' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {t.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-white">{formatCurrency(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;

