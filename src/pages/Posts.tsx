import React, { useState, useEffect, FormEvent } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Post } from '../types';
import { MessageSquare, ThumbsUp, Heart, Laugh, Send, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Posts() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [fbLink, setFbLink] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
    });
  }, []);

  const handleAddComment = async (postId: string) => {
    if (!user || !profile || !commentText[postId]) return;
    const postRef = doc(db, 'posts', postId);
    const newComment = {
      id: Math.random().toString(36).substring(7),
      userId: user.uid,
      userName: profile.name,
      content: commentText[postId],
      createdAt: new Date().toISOString(),
    };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment)
    });
    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !profile || profile.role !== 'admin') return;
    setIsPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: profile.name,
        content: newPost,
        fbLink,
        thumbnail,
        reacts: {},
        comments: [],
        createdAt: new Date().toISOString(),
      });
      setNewPost('');
      setFbLink('');
      setThumbnail('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReact = async (postId: string, emoji: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newReacts = { ...post.reacts };
    if (newReacts[user.uid] === emoji) {
      delete newReacts[user.uid];
    } else {
      newReacts[user.uid] = emoji;
    }

    await updateDoc(postRef, { reacts: newReacts });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ফাউন্ডেশন পোস্ট</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">অ্যাডমিনদের গুরুত্বপূর্ণ আপডেট ও ঘোষণা</p>
      </header>

      {/* Create Post (Admin Only) */}
      {profile?.role === 'admin' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              required
              placeholder="নতুন কিছু লিখুন..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none text-slate-800 dark:text-slate-100"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="url" 
                  placeholder="ফেসবুক লিংক (ঐচ্ছিক)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100"
                  value={fbLink}
                  onChange={(e) => setFbLink(e.target.value)}
                />
              </div>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="url" 
                  placeholder="থাম্বনেইল ইমেজ লিংক"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
              </div>
            </div>
            <button 
              disabled={isPosting}
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
            >
              {isPosting ? 'পোস্ট হচ্ছে...' : <><Send size={18} /> পোস্ট করুন</>}
            </button>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={post.id} 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {post.authorName[0]}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  {post.authorName} <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">Admin</span>
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                  {format(new Date(post.createdAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{post.content}</p>
              
              {post.thumbnail && (
                <div className="rounded-xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-700">
                  <img 
                    src={post.thumbnail} 
                    alt="Post thumbnail" 
                    className="w-full h-auto max-h-96 object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {post.fbLink && (
                <a 
                  href={post.fbLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline mb-4"
                >
                  <LinkIcon size={14} /> ফেসবুক পোস্ট দেখুন
                </a>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-1">
                  {[
                    { emoji: '👍', icon: ThumbsUp, color: 'text-blue-500' },
                    { emoji: '❤️', icon: Heart, color: 'text-red-500' },
                    { emoji: '😮', icon: Laugh, color: 'text-yellow-500' }
                  ].map((r) => {
                    const count = Object.values(post.reacts || {}).filter(e => e === r.emoji).length;
                    const isActive = user && post.reacts?.[user.uid] === r.emoji;
                    return (
                      <button
                        key={r.emoji}
                        onClick={() => handleReact(post.id, r.emoji)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all",
                          isActive ? "bg-slate-100 dark:bg-slate-700" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        )}
                      >
                        <span className="text-lg">{r.emoji}</span>
                        {count > 0 && <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{count}</span>}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                  className={cn(
                    "flex items-center gap-2 transition-colors px-3 py-1.5 rounded-full",
                    showComments[post.id] ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  )}
                >
                  <MessageSquare size={18} />
                  <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {showComments[post.id] && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 space-y-4"
                  >
                    <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">{comment.userName}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{format(new Date(comment.createdAt), 'dd MMM, hh:mm a')}</p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{comment.content}</p>
                        </div>
                      ))}
                      {(!post.comments || post.comments.length === 0) && (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">কোন কমেন্ট নেই।</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="কমেন্ট লিখুন..."
                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
