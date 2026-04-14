import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Wallet, Vote, MessageSquare, User, Shield, LogOut, Sun, Moon, History, Menu, X } from 'lucide-react';
import { auth } from '../firebase';
import { useAuth } from '../App';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function Navbar({ darkMode, setDarkMode }: { darkMode: boolean, setDarkMode: (v: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'হোম' },
    { path: '/fund', icon: Wallet, label: 'ফান্ড' },
    { path: '/voting', icon: Vote, label: 'ভোট' },
    { path: '/posts', icon: MessageSquare, label: 'পোস্ট' },
    { path: '/transactions', icon: History, label: 'লেনদেন' },
    { path: '/profile', icon: User, label: 'প্রোফাইল' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ path: '/admin', icon: Shield, label: 'অ্যাডমিন' });
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 h-16 rounded-2xl shadow-xl z-50 hidden md:flex items-center px-6 gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 dark:shadow-none group-hover:rotate-12 transition-transform">
            <Shield size={24} />
          </div>
          <span className="font-black text-slate-800 dark:text-white text-lg tracking-tight hidden lg:block">রামনগর যুব-কল্যান ফাউন্ডেশন</span>
        </Link>

        <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                  active ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={18} className="relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-all font-bold text-sm border border-red-100/50 dark:border-red-900/30"
          >
            <LogOut size={18} />
            লগআউট
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 h-16 rounded-2xl shadow-2xl z-50 flex md:hidden items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 transition-all",
                active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-active-mobile"
                  className="absolute -top-1 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                />
              )}
              <item.icon size={22} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
        
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500"
        >
          <Menu size={22} />
          <span className="text-[10px] font-bold">মেনু</span>
        </button>
      </nav>

      {/* Mobile Full Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end p-4 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-slate-800 w-full rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white">মেনু অপশন</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">আপনার প্রয়োজনীয় অপশন বেছে নিন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                      isActive(item.path) 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400" 
                        : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-bold text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setDarkMode(!darkMode);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl font-bold text-slate-700 dark:text-slate-200"
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{darkMode ? 'লাইট মুড' : 'ডার্ক মুড'}</span>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full relative transition-colors",
                    darkMode ? "bg-blue-600" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      darkMode ? "left-5" : "left-1"
                    )} />
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold"
                >
                  <LogOut size={20} />
                  <span>লগআউট করুন</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
