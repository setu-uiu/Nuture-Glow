import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Edit3, ImagePlus, Save, X, Trash2, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { JournalEntry } from '../types';
import { useTranslations } from '../i18n/I18nContext';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });
  const [attachments, setAttachments] = useState<JournalEntry['attachments']>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState({ title: '', content: '' });
  const [editAttachments, setEditAttachments] = useState<JournalEntry['attachments']>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const refreshEntries = async () => {
    if (!user) return;
    const data = await db.getJournalEntries(user.id);
    setEntries(data);
  };

  useEffect(() => {
    refreshEntries();
    const handleUpdate = () => {
      refreshEntries();
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const appendAttachments = (
    files: File[],
    apply: React.Dispatch<React.SetStateAction<JournalEntry['attachments']>>
  ) => {
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        alert(t('journal.largeFile', { name: file.name }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        apply(prev => [
          ...prev,
          { name: file.name, url: ev.target?.result as string, type: file.type }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!user || !newEntry.content.trim()) return;
    setSaving(true);

    await db.addJournalEntry(user.id, {
      ...newEntry,
      attachments
    });

    setIsWriting(false);
    setNewEntry({ title: '', content: '' });
    setAttachments([]);
    setSaving(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    appendAttachments(files, setAttachments);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleEditUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    appendAttachments(files, setEditAttachments);
    if (editFileRef.current) editFileRef.current.value = '';
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditEntry({ title: entry.title || '', content: entry.content || '' });
    setEditAttachments(entry.attachments || []);
    setIsWriting(false);
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setEditEntry({ title: '', content: '' });
    setEditAttachments([]);
  };

  const handleUpdate = async () => {
    if (!user || !editingEntryId || !editEntry.content.trim()) return;
    setUpdating(true);
    try {
      await db.updateJournalEntry(user.id, editingEntryId, {
        title: editEntry.title,
        content: editEntry.content,
        attachments: editAttachments
      });
      showToast(t('journal.updated'), 'success');
      cancelEdit();
    } catch (err) {
      showToast(t('journal.updateFailed'), 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (user && deleteConfirmId) {
      try {
        await db.deleteJournalEntry(user.id, deleteConfirmId);
        showToast("Journal entry deleted", "success");
      } catch (err) {
        showToast("Failed to delete entry", "error");
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20 relative text-[#3C342B]">
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#4A5A4A] text-[#F7F4EE]' : 'bg-[#7C3F3F] text-[#F7F4EE]'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FCFAF6] rounded-3xl p-8 max-w-sm w-full shadow-xl space-y-6 text-center border border-[#E4D9C7]">
            <div className="w-16 h-16 bg-[#F3E6E6] text-[#7C3F3F] rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={32}/>
            </div>
            <div>
              <h3 className="text-xl font-serif font-semibold text-[#2F2A23]">{t('journal.confirmDelete')}</h3>
              <p className="text-sm text-[#6B6257] mt-2">Are you sure you want to delete this journal entry?</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-3 bg-[#F3EFE7] text-[#6B6257] rounded-2xl font-semibold hover:bg-[#EDE5D8] transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-[#E4D9C7]"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                className="flex-1 py-3 bg-[#7C3F3F] text-[#F7F4EE] rounded-2xl font-semibold hover:bg-[#6B3434] transition-colors shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-[#BFA8A8]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-[#2F2A23]">{t('journal.title')}</h1>
          <p className="text-[#6B6257]">{t('journal.subtitle')}</p>
        </div>
        {!isWriting && !editingEntryId && (
          <button 
            onClick={() => setIsWriting(true)}
            className="flex items-center gap-2 px-8 py-4 bg-[#4A5A4A] text-[#F7F4EE] rounded-2xl font-semibold shadow-sm hover:bg-[#3E4C3E] transition-colors"
          >
            <Edit3 size={20}/> {t('journal.newEntry')}
          </button>
        )}
      </div>

      {isWriting && (
        <div className="bg-[#FCFAF6] p-8 rounded-3xl shadow-sm border border-[#E4D9C7] space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#EDE5D8] rounded-full flex items-center justify-center text-[#5C5247] font-semibold shrink-0 border border-[#E4D9C7] shadow-inner">
              {user?.name?.[0] || 'Y'}
            </div>
            <div className="flex-1 space-y-6">
              <input 
                className="w-full text-2xl font-serif font-semibold text-[#2F2A23] bg-transparent outline-none placeholder:text-[#C3B7A6]" 
                placeholder={t('journal.entryTitle')} 
                value={newEntry.title}
                onChange={e => setNewEntry({...newEntry, title: e.target.value})}
              />
              <textarea 
                className="w-full h-56 p-8 bg-[#F3EFE7] rounded-2xl outline-none border border-[#E4D9C7] focus:ring-2 focus:ring-[#C4AE83]/30 focus:border-[#C4AE83] resize-none text-lg font-medium text-[#3B352E] shadow-inner" 
                placeholder={t('journal.placeholder')}
                value={newEntry.content}
                onChange={e => setNewEntry({...newEntry, content: e.target.value})}
              />
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {attachments.map((at, i) => (
                <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm group border border-[#E4D9C7] bg-[#F7F3EC]">
                  {at.type?.startsWith('image') ? (
                    <img src={at.url} loading="lazy" className="w-full h-full object-cover" alt={at.name} />
                  ) : (
                    <div className="w-full h-full bg-[#F3EFE7] flex flex-col items-center justify-center p-2 text-center">
                      <FileText size={24} className="text-[#8C8174]" />
                      <span className="text-[8px] mt-1 line-clamp-1 text-[#6B6257]">{at.name}</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} 
                    className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-8 border-t border-[#E4D9C7]">
            <div className="flex gap-4">
              <button onClick={() => fileRef.current?.click()} className="p-4 bg-[#F3EFE7] text-[#7A6F64] hover:text-[#4A5A4A] hover:bg-[#EDE5D8] rounded-2xl transition-colors cursor-pointer"><ImagePlus size={24}/></button>
              <input type="file" ref={fileRef} className="hidden" multiple onChange={handleUpload} />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsWriting(false)} className="px-8 py-4 text-[#7A6F64] font-semibold hover:text-[#5C5247] transition-colors cursor-pointer">{t('journal.cancel')}</button>
              <button 
                onClick={handleSave}
                disabled={saving || !newEntry.content.trim()}
                className="px-10 py-4 bg-[#C4AE83] text-[#2B241C] rounded-2xl font-semibold shadow-sm flex items-center gap-2 hover:bg-[#B79F72] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save size={20}/> {t('journal.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="bg-[#FCFAF6] p-16 rounded-3xl text-center border border-dashed border-[#E4D9C7]">
             <BookOpen className="mx-auto text-[#D6C8B5] mb-4" size={64} />
             <p className="text-[#7A6F64] font-medium text-lg">{t('journal.empty')}</p>
          </div>
        ) : (
          entries.map(entry => {
            const imageAttachments = (entry.attachments || []).filter((at) => at.type?.startsWith('image'));
            const fileAttachments = (entry.attachments || []).filter((at) => !at.type?.startsWith('image'));

            return (
              <div key={entry.id} className="bg-[#FCFAF6] rounded-3xl shadow-sm border border-[#E4D9C7] overflow-hidden relative">
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-[#EDE5D8] rounded-full flex items-center justify-center text-[#5C5247] font-semibold text-sm border border-[#E4D9C7]">
                        {user?.name?.[0] || 'Y'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#2F2A23]">{t('community.you')}</h4>
                        <p className="text-[10px] text-[#9A8F82] font-semibold uppercase tracking-widest">
                          {new Date(entry.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEdit(entry)} 
                        className="p-2 text-[#9A8F82] hover:text-[#4A5A4A] hover:bg-[#EDE5D8] rounded-xl transition-colors cursor-pointer"
                        title={t('journal.edit')}
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(entry.id)} 
                        className="p-2 text-[#9A8F82] hover:text-[#7C3F3F] hover:bg-[#F3E6E6] rounded-xl transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>

                  {editingEntryId === entry.id ? (
                    <div className="space-y-6">
                      <input 
                        className="w-full text-2xl font-serif font-semibold text-[#2F2A23] bg-transparent outline-none placeholder:text-[#C3B7A6]" 
                        placeholder={t('journal.entryTitle')} 
                        value={editEntry.title}
                        onChange={e => setEditEntry({...editEntry, title: e.target.value})}
                      />
                      <textarea 
                        className="w-full h-52 p-6 bg-[#F3EFE7] rounded-2xl outline-none border border-[#E4D9C7] focus:ring-2 focus:ring-[#C4AE83]/30 focus:border-[#C4AE83] resize-none text-lg font-medium text-[#3B352E] shadow-inner" 
                        placeholder={t('journal.placeholder')}
                        value={editEntry.content}
                        onChange={e => setEditEntry({...editEntry, content: e.target.value})}
                      />

                      {editAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          {editAttachments.map((at, i) => (
                            <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-sm group border border-[#E4D9C7] bg-[#F7F3EC]">
                              {at.type?.startsWith('image') ? (
                                <img src={at.url} loading="lazy" className="w-full h-full object-cover" alt={at.name} />
                              ) : (
                                <div className="w-full h-full bg-[#F3EFE7] flex flex-col items-center justify-center p-2 text-center">
                                  <FileText size={24} className="text-[#8C8174]" />
                                  <span className="text-[8px] mt-1 line-clamp-1 text-[#6B6257]">{at.name}</span>
                                </div>
                              )}
                              <button 
                                onClick={() => setEditAttachments(editAttachments.filter((_, idx) => idx !== i))} 
                                className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12}/>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-6 border-t border-[#E4D9C7]">
                        <div className="flex gap-4">
                          <button onClick={() => editFileRef.current?.click()} className="p-4 bg-[#F3EFE7] text-[#7A6F64] hover:text-[#4A5A4A] hover:bg-[#EDE5D8] rounded-2xl transition-colors cursor-pointer"><ImagePlus size={24}/></button>
                          <input type="file" ref={editFileRef} className="hidden" multiple onChange={handleEditUpload} />
                        </div>
                        <div className="flex gap-4">
                          <button onClick={cancelEdit} className="px-8 py-4 text-[#7A6F64] font-semibold hover:text-[#5C5247] transition-colors cursor-pointer">{t('journal.cancel')}</button>
                          <button 
                            onClick={handleUpdate}
                            disabled={updating || !editEntry.content.trim()}
                            className="px-10 py-4 bg-[#C4AE83] text-[#2B241C] rounded-2xl font-semibold shadow-sm flex items-center gap-2 hover:bg-[#B79F72] transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Save size={20}/> {t('journal.update')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-serif font-semibold text-[#2F2A23]">{entry.title || t('journal.untitled')}</h3>
                        <p className="text-[#3B352E] leading-relaxed text-lg font-medium whitespace-pre-line">{entry.content}</p>
                      </div>

                      {imageAttachments.length > 0 && (
                        <div className={`grid ${imageAttachments.length === 1 ? 'grid-cols-1' : imageAttachments.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
                          {imageAttachments.map((at, i) => (
                            <div key={i} className="relative overflow-hidden rounded-2xl border border-[#E4D9C7] bg-[#F7F3EC] aspect-[4/3]">
                              <img
                                src={at.url}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={at.name}
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {fileAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {fileAttachments.map((at, i) => (
                            <div key={i} className="w-28 h-28 bg-[#F3EFE7] rounded-2xl flex flex-col items-center justify-center text-[#6B6257] border border-[#E4D9C7] p-3 text-center">
                              <FileText size={18}/>
                              <span className="text-[9px] mt-2 line-clamp-2">{at.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Journal;
