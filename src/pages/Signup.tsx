import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserCategory, SubscriptionType } from '../types';
import { Volume2, VolumeX, UserPlus, Info, CheckCircle, ShieldCheck, Heart, Users, BookOpen, Scale, Award, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const isCompletingProfile = location.state?.isCompletingProfile || false;

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    religion: 'Islam',
    profession: '',
    address: '',
    bloodGroup: 'O+',
    maritalStatus: 'Single',
    nid: '',
    subscriptionAmount: 100,
    subscriptionType: 'monthly' as SubscriptionType,
    mobileNo: '',
    fbId: '',
    category: 'A' as UserCategory,
    email: '',
    password: '',
    confirmPassword: '',
    joinDate: new Date().toISOString().split('T')[0],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [agreedToPledge, setAgreedToPledge] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (isCompletingProfile && auth.currentUser) {
      setFormData(prev => ({
        ...prev,
        name: auth.currentUser?.displayName || '',
        email: auth.currentUser?.email || '',
      }));
    }
  }, [isCompletingProfile]);

  const speak = (text: string) => {
    if (!isTtsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    window.speechSynthesis.speak(utterance);
  };

  const handleFocus = (field: string) => {
    const messages: { [key: string]: string } = {
      name: 'আপনার পূর্ণ নাম লিখুন।',
      fatherName: 'আপনার পিতার নাম লিখুন।',
      motherName: 'আপনার মাতার নাম লিখুন।',
      dob: 'আপনার জন্ম তারিখ সিলেক্ট করুন।',
      religion: 'আপনার ধর্ম নির্বাচন করুন।',
      profession: 'আপনার পেশা লিখুন।',
      address: 'আপনার বর্তমান ঠিকানা লিখুন।',
      bloodGroup: 'আপনার রক্তের গ্রুপ নির্বাচন করুন।',
      maritalStatus: 'আপনার বৈবাহিক অবস্থা নির্বাচন করুন।',
      nid: 'আপনার জাতীয় পরিচয় পত্র নম্বর দিন।',
      subscriptionAmount: 'আপনার মাসিক বা বাৎসরিক চাঁদার পরিমান লিখুন।',
      subscriptionType: 'চাঁদার ধরণ নির্বাচন করুন।',
      mobileNo: 'আপনার সচল মোবাইল নম্বরটি দিন।',
      fbId: 'আপনার ফেসবুক আইডি লিংক বা নাম দিন (ঐচ্ছিক)।',
      joinDate: 'সংগঠনে সদস্য হওয়ার তারিখ দিন।',
      category: 'আপনার সদস্য ক্যাটাগরি নির্বাচন করুন।',
      email: 'আপনার ইমেইল এড্রেসটি দিন যা লগইন করতে ব্যবহার করবেন।',
      password: 'কমপক্ষে ছয় অক্ষরের একটি শক্তিশালী পাসওয়ার্ড দিন।',
      confirmPassword: 'পাসওয়ার্ডটি পুনরায় টাইপ করুন।',
      pledge: 'অঙ্গীকারনামাটি পড়ুন এবং সম্মতি দিন।'
    };
    if (messages[field]) speak(messages[field]);
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreedToPledge) {
      setError('দয়া করে অঙ্গীকারনামায় সম্মতি দিন।');
      speak('দয়া করে অঙ্গীকারনামায় সম্মতি দিন।');
      return;
    }
    if (!isCompletingProfile && formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড মিলছে না।');
      speak('পাসওয়ার্ড মিলছে না।');
      return;
    }
    setLoading(true);
    setError('');

    try {
      let user = auth.currentUser;
      
      if (!isCompletingProfile) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = userCredential.user;
        await updateProfile(user, { displayName: formData.name });
      }

      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: formData.name,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          dob: formData.dob,
          religion: formData.religion,
          profession: formData.profession,
          address: formData.address,
          bloodGroup: formData.bloodGroup,
          maritalStatus: formData.maritalStatus,
          nid: formData.nid,
          subscriptionAmount: Number(formData.subscriptionAmount),
          subscriptionType: formData.subscriptionType,
          mobileNo: formData.mobileNo,
          fbId: formData.fbId,
          category: formData.category,
          email: formData.email,
          role: 'user',
          status: 'active',
          totalContribution: 0,
          contributionVisibility: true,
          joinDate: formData.joinDate,
          createdAt: serverTimestamp(),
          isProfileComplete: true,
        });

        setShowWelcome(true);
        speak('অভিনন্দন! রামনগর যুব-কল্যান ফাউন্ডেশনে আপনাকে স্বাগতম।');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err: any) {
      setError('রেজিস্ট্রেশন ব্যর্থ হয়েছে। ইমেইলটি ইতিমধ্যে ব্যবহৃত হতে পারে।');
      speak('রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-300">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-blue-100 dark:border-slate-700"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">অভিনন্দন!</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            রামনগর যুব-কল্যান ফাউন্ডেশনে আপনাকে স্বাগতম। আপনার সদস্যপদ সফলভাবে নিবন্ধিত হয়েছে।
          </p>
          <div className="animate-pulse text-blue-600 dark:text-blue-400 font-bold">
            ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 md:py-12 px-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">সদস্য ভর্তি ফরম</h1>
            <p className="text-blue-100 font-medium mt-1">রামনগর যুব-কল্যান ফাউন্ডেশন</p>
          </div>
          <button 
            onClick={() => {
              setIsTtsEnabled(!isTtsEnabled);
              if (!isTtsEnabled) speak('ভয়েস গাইড চালু করা হয়েছে।');
            }}
            className={`p-3 rounded-2xl transition-all duration-300 ${isTtsEnabled ? 'bg-white text-blue-600 shadow-lg scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}
            title={isTtsEnabled ? "ভয়েস বন্ধ করুন" : "ভয়েস চালু করুন"}
          >
            {isTtsEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        <div className="p-6 md:p-10">
          {/* Goals and Objectives */}
          <div className="mb-10 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl p-6 md:p-8 border border-blue-100 dark:border-blue-900/30">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-6 flex items-center gap-3">
              <Flag className="text-blue-600 dark:text-blue-400" /> লক্ষ্য ও উদ্দেশ্য
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Users, text: "সামাজিক কর্মকান্ড পরিচালনা করা।" },
                { icon: ShieldCheck, text: "মাদকের বিরুদ্ধে জনসচেতনতা সৃষ্টি করা।" },
                { icon: Heart, text: "যৌতুক ও বাল্য বিবাহ প্রতিরোধ করা।" },
                { icon: Award, text: "ইভটিজিং প্রতিরোধে জনসচেতনতা সৃষ্টি করা।" },
                { icon: Heart, text: "স্বেচ্ছায় রক্তদান কর্মসূচি বাস্তবায়ন করা।" },
                { icon: Users, text: "গরিব ও অসহায়দের সহায়তা করা।" },
                { icon: BookOpen, text: "সাহিত্য, সংস্কৃতি, ক্রীড়া ও বিনোদন উৎসাহিত করা।" },
                { icon: Scale, text: "মানবাধিকার রক্ষা ও ন্যায়বিচার প্রতিষ্ঠা করা।" }
              ].map((goal, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <div className="mt-1 p-1 bg-white dark:bg-slate-700 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
                    <goal.icon size={14} />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{goal.text}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-8 text-sm font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-ping" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-10">
            {/* Personal Info */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 dark:bg-blue-400 rounded-full" /> সদস্যের প্রয়োজনীয় তথ্যাদি
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">সদস্যের নাম *</label>
                  <input
                    type="text"
                    required
                    disabled={isCompletingProfile}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100 disabled:opacity-50"
                    value={formData.name || ''}
                    onFocus={() => handleFocus('name')}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">পিতার নাম *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.fatherName || ''}
                    onFocus={() => handleFocus('fatherName')}
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">মাতার নাম *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.motherName || ''}
                    onFocus={() => handleFocus('motherName')}
                    onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">জন্ম তারিখ *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.dob || ''}
                    onFocus={() => handleFocus('dob')}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ধর্ম *</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.religion || 'Islam'}
                    onFocus={() => handleFocus('religion')}
                    onChange={(e) => setFormData({...formData, religion: e.target.value})}
                  >
                    <option value="Islam">ইসলাম</option>
                    <option value="Hindu">হিন্দু</option>
                    <option value="Christian">খ্রিস্টান</option>
                    <option value="Buddhist">বৌদ্ধ</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">পেশা *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.profession || ''}
                    onFocus={() => handleFocus('profession')}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">রক্তের গ্রুপ *</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.bloodGroup || 'O+'}
                    onFocus={() => handleFocus('bloodGroup')}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">বৈবাহিক অবস্থা *</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.maritalStatus || 'Single'}
                    onFocus={() => handleFocus('maritalStatus')}
                    onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                  >
                    <option value="Single">অবিবাহিত</option>
                    <option value="Married">বিবাহিত</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">জাতীয় পরিচয় পত্র নং *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.nid || ''}
                    onFocus={() => handleFocus('nid')}
                    onChange={(e) => setFormData({...formData, nid: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ঠিকানা *</label>
                  <textarea
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all h-28 resize-none text-slate-800 dark:text-slate-100"
                    value={formData.address || ''}
                    onFocus={() => handleFocus('address')}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Subscription Info */}
            <section>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" /> চাঁদা ও সদস্যপদ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">চাঁদার পরিমান (৳) *</label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.subscriptionAmount ?? 100}
                    onFocus={() => handleFocus('subscriptionAmount')}
                    onChange={(e) => setFormData({...formData, subscriptionAmount: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">চাঁদার ধরণ *</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.subscriptionType || 'monthly'}
                    onFocus={() => handleFocus('subscriptionType')}
                    onChange={(e) => setFormData({...formData, subscriptionType: e.target.value as SubscriptionType})}
                  >
                    <option value="monthly">মাসিক</option>
                    <option value="yearly">বাৎসরিক</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ক্যাটাগরি *</label>
                  <select
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.category || 'A'}
                    onFocus={() => handleFocus('category')}
                    onChange={(e) => setFormData({...formData, category: e.target.value as UserCategory})}
                  >
                    <option value="A">ক্যাটাগরি A</option>
                    <option value="B">ক্যাটাগরি B</option>
                    <option value="C">ক্যাটাগরি C</option>
                    <option value="D">ক্যাটাগরি D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">মোবাইল নং *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.mobileNo || ''}
                    onFocus={() => handleFocus('mobileNo')}
                    onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ফেসবুক আইডি (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.fbId || ''}
                    onFocus={() => handleFocus('fbId')}
                    onChange={(e) => setFormData({...formData, fbId: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">সদস্য হওয়ার তারিখ *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                    value={formData.joinDate || ''}
                    onFocus={() => handleFocus('joinDate')}
                    onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  />
                </div>
              </div>
            </section>

            {/* Login Info (Only for new registrations) */}
            {!isCompletingProfile && (
              <section>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <div className="w-2 h-6 bg-slate-900 dark:bg-slate-100 rounded-full" /> লগইন তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ইমেইল *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                      value={formData.email || ''}
                      onFocus={() => handleFocus('email')}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                      value={formData.password || ''}
                      onFocus={() => handleFocus('password')}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">পাসওয়ার্ড নিশ্চিত করুন *</label>
                    <input
                      type="password"
                      required
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-800 dark:text-slate-100"
                      value={formData.confirmPassword || ''}
                      onFocus={() => handleFocus('confirmPassword')}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Pledge Section */}
            <section className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 md:p-10 text-white border border-slate-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Award className="text-blue-400" /> অঙ্গীকারনামা
              </h3>
              <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed text-justify">
                <p>
                  আমি <span className="text-white font-bold underline px-1">{formData.name || '.....'}</span> এই মর্মে অঙ্গীকার করিতেছি যে, রামনগর যুব-কল্যান ফাউন্ডেশনের লক্ষ্য ও উদ্দেশ্যের প্রতি পূর্ণ আস্থা ও বিশ্বাস নিয়ে সদস্য হওয়ার জন্য আবেদন করিতেছি।
                </p>
                <p>
                  আমি আরো অঙ্গীকার করিতেছি যে, রামনগর যুব-কল্যান ফাউন্ডেশনের স্বার্থ পরিপন্থী কোন কাজ করিব না। অত্র সংগঠনের নির্বাহী ও কার্য পরিষদ কর্তৃক যে কোন কর্মসূচি ও কর্মপদ্ধতি বাস্তবায়নের লক্ষ্যে আমি কাজ করিব।
                </p>
                <p>
                  এতদ্বার্থে আমি স্বেচ্ছায়, স্ব-জ্ঞানে অত্র সংগঠনের সদস্য ফরমের সকল নিয়ম কানুন পড়িয়া, শুনিয়া ও বুঝিয়া অন্যের প্ররোচনা ব্যতিরেকে নিম্নে স্বাক্ষর করিলাম।
                </p>
              </div>

              <label className="mt-8 flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={agreedToPledge}
                    onChange={(e) => setAgreedToPledge(e.target.checked)}
                    onFocus={() => handleFocus('pledge')}
                  />
                  <div className="w-6 h-6 border-2 border-slate-600 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all" />
                  <CheckCircle size={16} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">আমি সকল শর্তাবলীতে সম্মতি দিচ্ছি</span>
              </label>
            </section>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={24} /> {isCompletingProfile ? 'প্রোফাইল সম্পন্ন করুন' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
