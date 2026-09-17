'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, Plus, Send, X } from 'lucide-react';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiListResponse, ApiResponse, SupportTicket } from '@/types';

function senderName(sender: SupportTicket['messages'][number]['sender']) {
  return typeof sender === 'string' ? '' : sender.name;
}

export default function SupportPanel() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<SupportTicket | null>(null);

  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  function loadTickets() {
    setLoading(true);
    api
      .get<ApiListResponse<{ tickets: SupportTicket[] }>>('/support')
      .then((res) => setTickets(res.data.data.tickets))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (!activeId) {
      setActive(null);
      return;
    }
    api
      .get<ApiResponse<{ ticket: SupportTicket }>>(`/support/${activeId}`)
      .then((res) => setActive(res.data.data.ticket))
      .catch(() => setActive(null));
  }, [activeId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ ticket: SupportTicket }>>('/support', {
        subject,
        message: firstMessage,
      });
      setTickets((prev) => [res.data.data.ticket, ...prev]);
      setActiveId(res.data.data.ticket._id);
      setSubject('');
      setFirstMessage('');
      setCreating(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !reply.trim()) return;
    setSending(true);
    try {
      const res = await api.post<ApiResponse<{ ticket: SupportTicket }>>(`/support/${activeId}/messages`, {
        text: reply,
      });
      setActive(res.data.data.ticket);
      setTickets((prev) => prev.map((tk) => (tk._id === activeId ? res.data.data.ticket : tk)));
      setReply('');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div>
        <button onClick={() => setCreating((v) => !v)} className="btn-secondary mb-4 w-full">
          {creating ? <X size={15} /> : <Plus size={15} />}
          {creating ? t('support.cancel') : t('support.newTicket')}
        </button>

        {creating && (
          <form onSubmit={handleCreate} className="card mb-4 space-y-3 p-4">
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('support.subjectPlaceholder')}
              className="input-field text-sm"
            />
            <textarea
              required
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder={t('support.messagePlaceholder')}
              rows={3}
              className="input-field text-sm"
            />
            <button type="submit" disabled={submitting} className="btn-primary w-full text-sm">
              {submitting ? t('support.sending') : t('support.send')}
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-line-soft" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-ink-faint">{t('support.noTickets')}</p>
        ) : (
          <ul className="space-y-2">
            {tickets.map((tk) => (
              <li key={tk._id}>
                <button
                  onClick={() => setActiveId(tk._id)}
                  className={`w-full rounded-md border px-3.5 py-3 text-left transition-colors ${
                    activeId === tk._id ? 'border-accent-400 bg-accent-500/10' : 'border-line hover:bg-line-soft'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-ink">{tk.subject}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-ink-faint">
                      {new Date(tk.updatedAt).toLocaleDateString(locale === 'ka' ? 'ka-GE' : 'en-US')}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        tk.status === 'open' ? 'bg-accent-100 text-accent-800' : 'bg-line-soft text-ink-faint'
                      }`}
                    >
                      {tk.status === 'open' ? t('support.statusOpen') : t('support.statusClosed')}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {!active ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line py-20 text-center">
            <MessageCircle size={28} strokeWidth={1.25} className="text-ink-faint" />
            <p className="text-sm text-ink-soft">{t('support.selectTicket')}</p>
          </div>
        ) : (
          <div className="card flex h-[520px] flex-col p-0">
            <div className="border-b border-line px-5 py-4">
              <h3 className="font-bold text-ink">{active.subject}</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {active.messages.map((m) => {
                const isMine = typeof m.sender !== 'string' && user && m.sender._id === user._id;
                return (
                  <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-sm ${
                        isMine ? 'bg-accent-500 text-white' : 'bg-line-soft text-ink'
                      }`}
                    >
                      {!isMine && <p className="mb-0.5 text-xs font-semibold opacity-70">{senderName(m.sender)}</p>}
                      <p>{m.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form onSubmit={handleReply} className="flex items-center gap-2 border-t border-line p-4">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={t('support.replyPlaceholder')}
                className="input-field text-sm"
              />
              <button type="submit" disabled={sending || !reply.trim()} className="btn-primary shrink-0 px-3.5">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
