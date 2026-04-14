import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Poll } from '../types';
import { Vote as VoteIcon, CheckCircle2, Users, BarChart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Voting() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() } as Poll)));
    });
  }, []);

  const handleVote = async (pollId: string, optionIdx: number) => {
    if (!user) return;
    const poll = polls.find(p => p.id === pollId);
    if (!poll || poll.votedBy.includes(user.uid)) return;

    const newOptions = [...poll.options];
    newOptions[optionIdx].votes += 1;

    await updateDoc(doc(db, 'polls', pollId), {
      options: newOptions,
      votedBy: arrayUnion(user.uid)
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ভোট ও মতামত</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">ফাউন্ডেশনের বিভিন্ন সিদ্ধান্তে আপনার মতামত দিন</p>
      </header>

      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-400 dark:text-slate-500">বর্তমানে কোন সক্রিয় ভোট নেই।</p>
          </div>
        ) : (
          polls.map((poll) => {
            const hasVoted = user ? poll.votedBy.includes(user.uid) : false;
            const totalVotes = poll.votedBy.length;

            return (
              <motion.div 
                layout
                key={poll.id} 
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <VoteIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{poll.question}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Users size={12} /> {totalVotes} জন ভোট দিয়েছেন</span>
                      {hasVoted && <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> আপনি ভোট দিয়েছেন</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {poll.options.map((opt, idx) => {
                    const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    
                    return (
                      <button
                        key={idx}
                        disabled={hasVoted}
                        onClick={() => handleVote(poll.id, idx)}
                        className={cn(
                          "w-full relative h-12 rounded-xl border transition-all overflow-hidden group",
                          hasVoted ? "border-slate-100 dark:border-slate-700 cursor-default" : "border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400"
                        )}
                      >
                        {/* Progress Bar */}
                        {hasVoted && (
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 z-0"
                          />
                        )}
                        
                        <div className="absolute inset-0 px-4 flex justify-between items-center z-10">
                          <span className={cn(
                            "font-bold text-sm",
                            hasVoted ? "text-slate-700 dark:text-slate-300" : "text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                          )}>
                            {opt.text}
                          </span>
                          {hasVoted && (
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{percent}%</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {!hasVoted && (
                  <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase flex items-center gap-1">
                    <BarChart size={10} /> ফলাফল দেখতে ভোট দিন
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
