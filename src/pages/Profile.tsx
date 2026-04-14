import React, { useState, FormEvent } from 'react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { User, MapPin, Calendar, Mail, Phone, Facebook, Shield, Edit3, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.name || '',
    address: profile?.address || '',
    dob: profile?.dob || '',
  });
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const handleUpdateVisibility = async () => {
    await updateDoc(doc(db, 'users', profile.uid), {
      contributionVisibility: !profile.contributionVisibility
    });
  };

  const handleSubmitRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        userId: user.uid,
        userName: profile.name,
        message: `প্রোফাইল পরিবর্তনের অনুরোধ: \nনাম: ${editData.name}\nঠিকানা: ${editData.address}\nজন্ম তারিখ: ${editData.dob}`,
        type: 'profile_update',
        data: editData,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      alert('আপনার অনুরোধ অ্যাডমিনের কাছে পাঠানো হয়েছে। অনুমোদিত হলে প্রোফাইল আপডেট হবে।');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="px-6 pb-6">
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-lg">
              <div className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
                {profile.name[0]}
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Edit3 size={16} /> এডিট প্রোফাইল
            </button>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {profile.name} {profile.role === 'admin' && <Shield size={20} className="text-blue-600 dark:text-blue-400" />}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{profile.profession || 'সদস্য'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <MapPin size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-sm">{profile.address}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-sm">{profile.dob}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Mail size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Phone size={18} className="text-slate-400 dark:text-slate-500" />
              <span className="text-sm">{profile.mobileNo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Card */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">আপনার মোট জমা</p>
          <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">৳{profile.totalContribution}</h2>
        </div>
        <button 
          onClick={handleUpdateVisibility}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
            profile.contributionVisibility ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          )}
        >
          {profile.contributionVisibility ? <><Eye size={18} /> দৃশ্যমান</> : <><EyeOff size={18} /> লুকানো</>}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">প্রোফাইল পরিবর্তনের অনুরোধ</h3>
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">নাম</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100"
                value={editData.name || ''}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ঠিকানা</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100"
                value={editData.address || ''}
                onChange={(e) => setEditData({...editData, address: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">জন্ম তারিখ</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100"
                value={editData.dob || ''}
                onChange={(e) => setEditData({...editData, dob: e.target.value})}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {loading ? 'প্রসেসিং...' : 'অনুরোধ পাঠান'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Admin Contact */}
      <div className="bg-slate-900 p-8 rounded-3xl text-white">
        <h3 className="text-xl font-bold mb-6">অ্যাডমিন যোগাযোগ</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs">ইমেইল</p>
              <p className="font-medium">mr4425390@gmail.com</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs">মোবাইল</p>
              <p className="font-medium">01941429881</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Facebook size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-xs">ফেসবুক</p>
              <a href="https://www.facebook.com/rakibul.islam.140316" target="_blank" rel="noreferrer" className="font-medium hover:underline">
                Rakibul Islam
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
