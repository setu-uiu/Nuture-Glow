import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Trash2, Send, ImagePlus, Sparkles, X, CheckCircle2, AlertTriangle, MoreVertical } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { CommunityPost } from '../types';
import { useTranslations } from '../i18n/I18nContext';

export const Community: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [activePostComments, setActivePostComments] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteCommentConfirm, setDeleteCommentConfirm] = useState<{postId: string, commentId: string} | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshPosts = async () => {
    const data = await db.getPosts();
    setPosts(data || []);
  };

  useEffect(() => {
    refreshPosts();
    const handleUpdate = () => {
      refreshPosts();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePost = async () => {
    if (!user || !newPostContent.trim()) return;
    await db.addPost(user.id, user.name || t('community.anonymousUser'), newPostContent, selectedImg || undefined);
    setNewPostContent('');
    setSelectedImg(null);
    showToast(t('community.success.posted'));
    refreshPosts();
  };

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!user) return;
    await db.toggleLike(user.id, postId);
    refreshPosts();
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentContent.trim()) return;
    await db.addComment(user.id, user.name || t('community.anonymousUser'), postId, commentContent);
    setCommentContent('');
    showToast(t('community.success.commented'));
    refreshPosts();
  };

  const confirmDeletePost = async (postId: string) => {
    await db.deletePost(postId);
    setDeleteConfirmId(null);
    showToast(t('community.success.deleted'));
    refreshPosts();
  };

  const confirmDeleteComment = async (postId: string, commentId: string) => {
    await db.deleteComment(postId, commentId);
    setDeleteCommentConfirm(null);
    showToast(t('community.success.removed'));
    refreshPosts();
  };

  const handleImgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('journal.largeFile', { name: file.name }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedImg(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20 relative">
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-teal-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32}/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{t('community.deletePost')}</h3>
              <p className="text-sm text-gray-500 mt-2">{t('community.deletePostDesc')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer">{t('common.cancel')}</button>
              <button onClick={() => confirmDeletePost(deleteConfirmId)} className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 cursor-pointer">OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-[#F7F5EF] rounded-full flex items-center justify-center text-teal-600 font-bold shrink-0 border border-teal-50 shadow-inner">
            {user?.name?.[0] || 'A'}
          </div>
          <textarea 
            className="w-full h-32 p-6 bg-[#F7F5EF] rounded-3xl outline-none border-2 border-transparent focus:bg-white focus:border-[#BFE6DA] focus:ring-4 focus:ring-[#BFE6DA]/10 transition-all resize-none text-sm font-medium shadow-inner" 
            placeholder={t('community.share')}
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
          />
        </div>
        
        {selectedImg && (
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-md group">
            <img src={selectedImg} loading="lazy" className="w-full h-full object-cover" />
            <button onClick={() => setSelectedImg(null)} className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-50">
          <div className="flex gap-4">
            <button onClick={() => fileRef.current?.click()} className="p-3 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all cursor-pointer"><ImagePlus size={20}/></button>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImgUpload} />
          </div>
          <button 
            onClick={handlePost}
            disabled={!newPostContent.trim()}
            className="px-10 py-4 bg-[#E6C77A] text-white rounded-2xl font-bold shadow-xl shadow-[#E6C77A]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs cursor-pointer"
          >
            {t('community.post')}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <MessageSquare size={32}/>
            </div>
            <p className="text-gray-400 font-medium italic">{t('community.empty')}</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 relative z-10">
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-sm border border-teal-100">
                      {post.authorName?.[0] || 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{post.userId === user?.id ? t('community.you') : t('community.anonymousUser')}</h4>
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{new Date(post.createdAt).toLocaleTimeString()} • {t('community.verifiedMember')}</p>
                    </div>
                  </div>
                  {user && user.id === post.userId && (
                    <button 
                      onClick={() => setDeleteConfirmId(post.id)} 
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer relative z-20"
                    >
                      <Trash2 size={20}/>
                    </button>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed text-lg font-medium">{post.content}</p>

                {post.image && (
                  <div className="rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                    <img src={post.image} loading="lazy" className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-700" alt="Community shared" />
                  </div>
                )}

                <div className="flex gap-8 pt-4 border-t border-gray-50">
                  <button 
                    onClick={(e) => handleLike(e, post.id)}
                    className={`flex items-center gap-2 font-bold text-sm transition-all group cursor-pointer ${post.likes.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${post.likes.includes(user?.id || '') ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
                      <Heart size={20} fill={post.likes.includes(user?.id || '') ? 'currentColor' : 'none'} />
                    </div>
                    <span>{post.likes.length} {t('community.likes')}</span>
                  </button>
                  <button 
                    onClick={() => setActivePostComments(activePostComments === post.id ? null : post.id)}
                    className={`flex items-center gap-2 font-bold text-sm transition-all group cursor-pointer ${activePostComments === post.id ? 'text-teal-600' : 'text-gray-400 hover:text-teal-600'}`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${activePostComments === post.id ? 'bg-teal-50' : 'group-hover:bg-teal-50'}`}>
                      <MessageSquare size={20} />
                    </div>
                    <span>{post.comments.length} {t('community.comments')}</span>
                  </button>
                </div>
              </div>

              {activePostComments === post.id && (
                <div className="bg-[#F7F5EF]/50 p-8 space-y-6 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-4">
                    {post.comments.map((c) => (
                      <div key={c.id} className="flex gap-4 group/comment">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-teal-600 font-bold text-[10px] shrink-0 shadow-sm border border-teal-50">
                          {c.authorName?.[0] || 'A'}
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm text-sm border border-gray-50 flex-1 relative group">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-gray-800">{c.userId === user?.id ? t('community.you') : t('community.anonymousUser')}</p>
                            {user && user.id === c.userId && (
                              <button 
                                onClick={() => setDeleteCommentConfirm({postId: post.id, commentId: c.id})}
                                className="p-1 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                title={t('community.removeComment')}
                              >
                                <Trash2 size={12}/>
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 leading-relaxed font-medium">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {deleteCommentConfirm && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                      <div className="bg-white p-6 rounded-[28px] max-w-xs w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
                        <p className="font-bold text-gray-800">{t('community.removeComment')}</p>
                        <div className="flex gap-2">
                           <button onClick={() => setDeleteCommentConfirm(null)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold cursor-pointer">{t('common.back')}</button>
                           <button onClick={() => confirmDeleteComment(deleteCommentConfirm.postId, deleteCommentConfirm.commentId)} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer">{t('appointments.cancel')}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 relative">
                    <input 
                      className="w-full py-4 pl-6 pr-14 bg-white rounded-2xl outline-none shadow-sm text-sm font-medium border-2 border-transparent focus:border-teal-100 transition-all" 
                      placeholder={t('community.addComment')}
                      value={commentContent}
                      onChange={e => setCommentContent(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                    />
                    <button 
                      onClick={() => handleComment(post.id)} 
                      disabled={!commentContent.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-teal-600 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-30 active:scale-90 cursor-pointer"
                    >
                      <Send size={20}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
