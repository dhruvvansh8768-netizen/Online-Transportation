import React, { useState } from 'react';
import { Tag, Plus, Trash2, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const INITIAL_PROMOS = [
  { id: 1, code: 'WELCOME10', discount: 10, expiry: '2026-12-31' },
  { id: 2, code: 'RIDE20', discount: 20, expiry: '2026-10-31' },
  { id: 3, code: 'FIRST50', discount: 50, expiry: '2026-09-30' },
  { id: 4, code: 'SAVE15', discount: 15, expiry: '2026-11-30' },
  { id: 5, code: 'FESTIVE25', discount: 25, expiry: '2026-10-15' },
  { id: 6, code: 'NEWUSER30', discount: 30, expiry: '2026-12-15' },
  { id: 10, code: 'RIDE100', discount: 100, expiry: '2026-12-31' },
];

/**
 * PromoManagement — CRUD for PROMOCODE table (Code, Discount, ExpiryDate)
 */
const PromoManagement = () => {
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', expiry: '2026-12-31' });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discount) return;
    setPromos((prev) => [
      { id: Date.now(), code: form.code.toUpperCase(), discount: Number(form.discount), expiry: form.expiry },
      ...prev,
    ]);
    setForm({ code: '', discount: '', expiry: '2026-12-31' });
    setModalOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy-900 py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-accent" /> Promo Code Management
            </h1>
            <p className="text-sm text-gray-400">Create and manage PROMOCODE offers & expiry dates</p>
          </div>
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Create Promo
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((p) => (
            <div key={p.id} className="bg-navy-800 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-accent bg-accent/15 px-3 py-1 rounded-lg text-sm">
                  {p.code}
                </span>
                <button
                  onClick={() => setPromos(promos.filter((item) => item.id !== p.id))}
                  className="text-gray-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-2xl font-bold text-white">₹{p.discount}.00 OFF</p>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Expires: {p.expiry}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Promo Code" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Promo Code"
            placeholder="AHMEDABAD50"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <Input
            label="Discount Amount (₹)"
            type="number"
            placeholder="50"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
            required
          />
          <Input
            label="Expiry Date"
            type="date"
            value={form.expiry}
            onChange={(e) => setForm({ ...form, expiry: e.target.value })}
            required
          />
          <Button type="submit" fullWidth>
            Save Promo Code
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default PromoManagement;

