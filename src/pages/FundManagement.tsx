import React, { useState, useEffect, FormEvent } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { FundTransaction, AppSettings } from '../types';
import { Wallet, Plus, History, CreditCard, Smartphone, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function FundManagement() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');

  useEffect(() => {
    if (profile?.subscriptionAmount) {
      setAmount(profile.subscriptionAmount.toString());
    }
  }, [profile]);
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data() as AppSettings);
    });

    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid)
    );
    
    const unsubTrans = onSnapshot(q, (snap) => {
      const trans = snap.docs.map(d => ({ id: d.id, ...d.data() } as FundTransaction));
      // Sort client-side to avoid composite index requirement
      trans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(trans);
    });

    return () => {
      unsubSettings();
      unsubTrans();
    };
  }, [user]);

  const handleAddMoney = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: profile.name,
        amount: Number(amount),
        type: 'income',
        category: 'সদস্য চাঁদা',
        paymentMethod: method,
        transactionId: txId,
        status: 'pending',
        date: new Date().toISOString(),
      });
      setIsAddModalOpen(false);
      setAmount('');
      setTxId('');
      alert('অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদন করলে ফান্ডে যোগ হবে।');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMethodNumber = () => {
    if (!settings) return '01941429881';
    if (method === 'bkash') return settings.bkashNo || '01941429881';
    if (method === 'nagad') return settings.nagadNo || '01941429881';
    if (method === 'rocket') return settings.rocketNo || '01941429881';
    return '01941429881';
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ফান্ড ম্যানেজমেন্ট</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">আপনার জমার হিসাব এবং নতুন জমা</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
        >
          <Plus size={20} /> টাকা জমা দিন
        </button>
      </header>

      {/* User Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">আপনার মোট জমা</p>
            <h2 className="text-4xl font-bold">৳{profile?.totalContribution || 0}</h2>
          </div>
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Wallet size={32} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-blue-100 text-xs mb-1">এই মাসে জমা</p>
            <p className="font-bold">৳0</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-blue-100 text-xs mb-1">সদস্যপদ</p>
            <p className="font-bold">{profile?.subscriptionType === 'monthly' ? 'মাসিক' : 'বাৎসরিক'}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-2">
          <History size={20} className="text-slate-400 dark:text-slate-500" />
          <h2 className="font-bold text-slate-800 dark:text-slate-100">জমার ইতিহাস</h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {transactions.length === 0 ? (
            <p className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">আপনি এখনো কোন টাকা জমা দেননি।</p>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    t.status === 'approved' ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : 
                    t.status === 'pending' ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  )}>
                    {t.status === 'approved' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{t.category}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{format(new Date(t.date), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-slate-100">৳{t.amount}</p>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    t.status === 'approved' ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400" : 
                    t.status === 'pending' ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                  )}>
                    {t.status === 'approved' ? 'গৃহীত' : t.status === 'pending' ? 'পেন্ডিং' : 'বাতিল'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="bg-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold">টাকা জমা দিন</h3>
                <p className="text-blue-100 text-sm">নিচের যে কোন মাধ্যমে টাকা পাঠিয়ে তথ্য দিন</p>
              </div>
              
              <form onSubmit={handleAddMoney} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    type="button"
                    onClick={() => setMethod('bkash')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      method === 'bkash' ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20" : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                    )}
                  >
                    <img src="https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg" alt="bKash" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">বিকাশ</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMethod('nagad')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      method === 'nagad' ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                    )}
                  >
                    <img src="https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg" alt="Nagad" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">নগদ</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMethod('rocket')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      method === 'rocket' ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600"
                    )}
                  >
                    <img src="https://www.logo.wine/a/logo/Dutch_Bangla_Bank/Dutch_Bangla_Bank-Logo.wine.svg" alt="Rocket" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">রকেট</span>
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">সেন্ড মানি করুন এই নম্বরে:</p>
                  <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wider">{getMethodNumber()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">টাকার পরিমাণ</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500">৳</span>
                    <input
                      type="number"
                      required
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-slate-800 dark:text-slate-100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ট্রানজেকশন আইডি (TxID)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-800 dark:text-slate-100"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    placeholder="ABC123XYZ"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? 'প্রসেসিং...' : <><CreditCard size={20} /> রিকোয়েস্ট পাঠান</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
