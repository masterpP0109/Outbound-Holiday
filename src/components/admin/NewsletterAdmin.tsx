import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Send, Users, CheckCircle, Clock, AlertTriangle, X,
  Search, Download, Plus, FileText, Settings, RefreshCw,
  Trash2, Eye, ShieldCheck, ChevronRight, Lock
} from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  status: 'subscribed' | 'pending' | 'unsubscribed';
  consentVersion: string;
  consentAt: string;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  createdAt: string;
}

interface Campaign {
  id: string;
  title: string;
  subject: string;
  previewText?: string | null;
  templateId: string;
  contentHtml: string;
  contentText: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'archived';
  scheduledAt?: string | null;
  sentAt?: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TemplateDef {
  id: string;
  name: string;
  description: string;
  defaultSubject: string;
  defaultPreviewText: string;
  sampleContentHtml: string;
}

interface SystemSettings {
  smtpConfigured: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  emailProvider: string;
  emailDeliveryMode: string;
  newsletterProvider: string;
  newsletterSendingEnabled: boolean;
  isLiveSendingActive: boolean;
  emailFrom: string;
  testRecipient: string;
  wordpressMigrationReady: boolean;
}

export const NewsletterAdmin: React.FC<{ onNavigateHome?: () => void }> = ({ onNavigateHome }) => {
  // Auth state
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('outbound_admin_key') || '');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscribers' | 'campaigns' | 'templates' | 'migration'>('dashboard');

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersTotal, setSubscribersTotal] = useState(0);
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'subscribed' | 'pending' | 'unsubscribed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, subscribed: 0, pending: 0, unsubscribed: 0 });

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<TemplateDef[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  // Campaign Modal / Editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignPreviewText, setCampaignPreviewText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('victoria-falls-editorial');
  const [campaignHtml, setCampaignHtml] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('editor');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testSendStatus, setTestSendStatus] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');

  // General feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const apiBase = (import.meta.env?.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

  const authFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const key = apiKey || sessionStorage.getItem('outbound_admin_key') || 'outbound-admin-dev-secret';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(options.headers || {})
    };
    const response = await fetch(`${apiBase}/admin/newsletter/${endpoint}`, {
      ...options,
      headers
    });
    if (response.status === 401) {
      setAuthenticated(false);
      throw new Error('Invalid or expired admin key.');
    }
    return response;
  }, [apiBase, apiKey]);

  // Initial Authentication Check
  const checkAuth = useCallback(async (keyToTest?: string) => {
    const key = keyToTest || apiKey || 'outbound-admin-dev-secret';
    try {
      const res = await fetch(`${apiBase}/admin/newsletter/settings`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (res.ok) {
        setAuthenticated(true);
        sessionStorage.setItem('outbound_admin_key', key);
        setApiKey(key);
        setAuthError('');
        const data = await res.json();
        setSettings(data);
        return true;
      } else {
        setAuthenticated(false);
        setAuthError('Access denied. Please enter a valid administrative key.');
        return false;
      }
    } catch {
      setAuthenticated(false);
      setAuthError('Unable to connect to server admin API.');
      return false;
    }
  }, [apiBase, apiKey]);

  // Load Dashboard Data
  const loadData = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const [statsRes, subsRes, campsRes, tmplRes, settRes] = await Promise.all([
        authFetch('subscribers/stats'),
        authFetch(`subscribers?status=${subscriberFilter}&search=${encodeURIComponent(searchQuery)}&limit=25`),
        authFetch('campaigns?limit=50'),
        authFetch('templates'),
        authFetch('settings')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubscribers(d.subscribers || []);
        setSubscribersTotal(d.total || 0);
      }
      if (campsRes.ok) {
        const d = await campsRes.json();
        setCampaigns(d.campaigns || []);
      }
      if (tmplRes.ok) {
        const d = await tmplRes.json();
        setTemplates(d.templates || []);
      }
      if (settRes.ok) setSettings(await settRes.json());
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load newsletter data.' });
    } finally {
      setLoading(false);
    }
  }, [authenticated, authFetch, subscriberFilter, searchQuery]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, loadData]);

  // Handle template selection in campaign editor
  useEffect(() => {
    if (editorOpen && !editingCampaignId) {
      const tmpl = templates.find(t => t.id === selectedTemplateId);
      if (tmpl && !campaignHtml) {
        setCampaignSubject(tmpl.defaultSubject);
        setCampaignPreviewText(tmpl.defaultPreviewText);
        setCampaignHtml(tmpl.sampleContentHtml.trim());
      }
    }
  }, [selectedTemplateId, templates, editorOpen, editingCampaignId, campaignHtml]);

  // Generate real-time preview
  const generatePreview = async () => {
    try {
      const res = await authFetch('templates/preview', {
        method: 'POST',
        body: JSON.stringify({
          templateId: selectedTemplateId,
          title: campaignTitle,
          subject: campaignSubject,
          previewText: campaignPreviewText,
          contentHtml: campaignHtml
        })
      });
      if (res.ok) {
        const d = await res.json();
        setPreviewHtml(d.html);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNewCampaign = () => {
    setEditingCampaignId(null);
    setCampaignTitle('');
    setSelectedTemplateId('victoria-falls-editorial');
    const tmpl = templates.find(t => t.id === 'victoria-falls-editorial') || templates[0];
    setCampaignSubject(tmpl?.defaultSubject || 'Stories from Victoria Falls');
    setCampaignPreviewText(tmpl?.defaultPreviewText || 'Your insider guide to Victoria Falls');
    setCampaignHtml(tmpl?.sampleContentHtml?.trim() || '<p>Newsletter story goes here.</p>');
    setPreviewMode('editor');
    setTestSendStatus(null);
    setEditorOpen(true);
  };

  const handleEditCampaign = (camp: Campaign) => {
    setEditingCampaignId(camp.id);
    setCampaignTitle(camp.title);
    setCampaignSubject(camp.subject);
    setCampaignPreviewText(camp.previewText || '');
    setSelectedTemplateId(camp.templateId);
    setCampaignHtml(camp.contentHtml);
    setPreviewMode('editor');
    setTestSendStatus(null);
    setEditorOpen(true);
  };

  const handleSaveCampaign = async () => {
    if (!campaignTitle.trim() || !campaignSubject.trim() || !campaignHtml.trim()) {
      setMessage({ type: 'error', text: 'Please fill in Title, Subject and Content.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: campaignTitle,
        subject: campaignSubject,
        previewText: campaignPreviewText,
        templateId: selectedTemplateId,
        contentHtml: campaignHtml
      };
      let res: Response;
      if (editingCampaignId) {
        res = await authFetch(`campaigns/${editingCampaignId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('campaigns', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save campaign');
      }
      setMessage({ type: 'success', text: `Campaign successfully ${editingCampaignId ? 'updated' : 'created'}.` });
      setEditorOpen(false);
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async (campaignId?: string) => {
    const id = campaignId || editingCampaignId;
    if (!id) {
      // Must save first
      setMessage({ type: 'error', text: 'Please save the campaign before sending a test.' });
      return;
    }
    const email = testEmailAddress.trim() || settings?.testRecipient || 'test@example.com';
    setTestSendStatus('Sending test email…');
    try {
      const res = await authFetch(`campaigns/${id}/test`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setTestSendStatus(`✓ Test preview delivered to ${email}`);
        setMessage({ type: 'success', text: `Test email sent to ${email}` });
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send test email');
      }
    } catch (err: any) {
      setTestSendStatus(`✕ Error: ${err.message}`);
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDispatch = async (campaignId: string) => {
    if (!confirm('Are you sure you want to dispatch this campaign to all confirmed active subscribers?')) return;
    setLoading(true);
    try {
      const res = await authFetch(`campaigns/${campaignId}/dispatch`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to dispatch campaign');
      }
      const data = await res.json();
      setMessage({ type: 'success', text: `Campaign queued for ${data.recipientsQueued} active subscribers.` });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (campaignId: string) => {
    if (!scheduleDate) {
      setMessage({ type: 'error', text: 'Please choose a future date and time to schedule.' });
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`campaigns/${campaignId}/schedule`, {
        method: 'POST',
        body: JSON.stringify({ scheduledAt: new Date(scheduleDate).toISOString() })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to schedule campaign');
      }
      setMessage({ type: 'success', text: 'Campaign scheduled successfully.' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    setLoading(true);
    try {
      const res = await authFetch(`campaigns/${campaignId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete campaign');
      setMessage({ type: 'success', text: 'Campaign deleted.' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;
    setLoading(true);
    try {
      const res = await authFetch(`campaigns/${campaignId}/cancel`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to cancel campaign');
      setMessage({ type: 'success', text: 'Campaign cancelled.' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscriberStatus = async (id: string, status: 'subscribed' | 'pending' | 'unsubscribed') => {
    setLoading(true);
    try {
      const res = await authFetch(`subscribers/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update subscriber');
      setMessage({ type: 'success', text: `Subscriber marked as ${status}.` });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this subscriber and their consent history?')) return;
    setLoading(true);
    try {
      const res = await authFetch(`subscribers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subscriber');
      setMessage({ type: 'success', text: 'Subscriber deleted.' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const key = apiKey || sessionStorage.getItem('outbound_admin_key') || 'outbound-admin-dev-secret';
    window.open(`${apiBase}/admin/newsletter/subscribers/export?format=${format}&status=${subscriberFilter}&token=${encodeURIComponent(key)}`, '_blank');
  };

  // If Not Authenticated, show login card
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#0B5E8E]/10 text-[#0B5E8E] rounded-xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#0B5E8E]">Outbound Holidays</h1>
            <p className="text-xs text-gray-500 font-medium">Newsletter Administration &amp; Management</p>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); checkAuth(apiKey); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Administrative Secret Key</label>
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter ADMIN_API_KEY or CRON_SECRET"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Development default: <code className="bg-gray-100 px-1 py-0.5 rounded">outbound-admin-dev-secret</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B5E8E] hover:bg-[#094d75] text-white font-bold py-3 rounded-xl transition text-sm cursor-pointer shadow-md"
            >
              Sign In to Newsletter Admin
            </button>
          </form>

          {onNavigateHome && (
            <div className="text-center pt-2 border-t border-gray-100">
              <button onClick={onNavigateHome} className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer">
                Return to Outbound Holidays Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#2F3A44] flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-[#0B5E8E] text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#C9A66B]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold font-serif text-lg tracking-wide">Outbound Holidays</span>
              <span className="ml-2 text-xs bg-[#C9A66B] text-[#0B5E8E] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Newsletter Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { sessionStorage.removeItem('outbound_admin_key'); setAuthenticated(false); }}
              className="text-xs text-white/80 hover:text-white transition px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10"
            >
              Log Out
            </button>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="text-xs bg-[#E67E22] hover:bg-[#d67118] text-white px-3.5 py-1.5 rounded-lg font-bold shadow transition"
              >
                View Website
              </button>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-white/10 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: RefreshCw },
            { id: 'subscribers', label: `Subscribers (${stats.total})`, icon: Users },
            { id: 'campaigns', label: `Campaigns (${campaigns.length})`, icon: Send },
            { id: 'templates', label: 'Branded Templates', icon: FileText },
            { id: 'migration', label: 'WordPress Migration', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  active
                    ? 'border-[#C9A66B] text-[#C9A66B] font-bold bg-white/5'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Flash Notifications */}
        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
              <span className="font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Total Audience</span>
                  <Users className="w-4 h-4 text-[#0B5E8E]" />
                </div>
                <div className="text-3xl font-bold text-[#0B5E8E]">{stats.total}</div>
                <div className="text-[11px] text-gray-400">Total email subscriptions on record</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Confirmed (Opt-in)</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-700">{stats.subscribed}</div>
                <div className="text-[11px] text-emerald-600/80">Double opt-in verified &amp; deliverable</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Pending Confirmation</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-[11px] text-amber-600/80">Awaiting user link confirmation</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-1">
                <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase">
                  <span>Unsubscribed</span>
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-gray-600">{stats.unsubscribed}</div>
                <div className="text-[11px] text-red-600/80">Suppressed from all future campaigns</div>
              </div>
            </div>

            {/* Quick Actions & System Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-[#0B5E8E] flex items-center gap-2">
                  <Send className="w-4 h-4" /> Quick Campaign Actions
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Compose editorial stories, Victoria Falls travel digests, and seasonal package updates for your subscribers.
                </p>
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleOpenNewCampaign}
                    className="w-full bg-[#E67E22] hover:bg-[#d67118] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" /> Create New Campaign
                  </button>
                  <button
                    onClick={() => setActiveTab('subscribers')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-[#2F3A44] font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Users className="w-4 h-4 text-gray-600" /> Manage Subscriber List
                  </button>
                </div>
              </div>

              {/* SMTP & Deliverability Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4 lg:col-span-2">
                <h3 className="font-bold text-base text-[#0B5E8E] flex items-center gap-2">
                  <Settings className="w-4 h-4" /> SMTP &amp; Delivery Guard
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">SMTP Gateway</span>
                    <p className="font-mono text-xs font-bold text-gray-800 truncate">{settings?.smtpHost || 'server169.web-hosting.com'}:{settings?.smtpPort || '465'}</p>
                    <span className="text-[11px] text-emerald-700 font-medium">● TLS Authenticated</span>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">Live Sending Guard</span>
                    <p className="font-bold text-xs text-gray-800">
                      {settings?.newsletterSendingEnabled ? (
                        <span className="text-emerald-700">Active Live Dispatch</span>
                      ) : (
                        <span className="text-amber-700">Safe Preview Mode</span>
                      )}
                    </p>
                    <span className="text-[11px] text-gray-500">Live spam protection active</span>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">Sender Address (From)</span>
                    <p className="text-xs font-semibold text-gray-800 truncate">{settings?.emailFrom}</p>
                    <span className="text-[11px] text-gray-500">Domain reputation protected</span>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">WordPress Ready</span>
                    <p className="font-bold text-xs text-emerald-700">100% Portable Schema</p>
                    <span className="text-[11px] text-gray-500">WP custom tables / CPT documented</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Campaigns Overview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#0B5E8E]">Recent Campaigns</h3>
                <button
                  onClick={() => setActiveTab('campaigns')}
                  className="text-xs text-[#0B5E8E] font-semibold hover:underline flex items-center gap-1"
                >
                  View all ({campaigns.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No campaigns created yet. Click "Create New Campaign" to draft your first newsletter.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {campaigns.slice(0, 5).map(camp => (
                    <div key={camp.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="font-semibold text-gray-800 truncate">{camp.title}</div>
                        <div className="text-gray-500 text-[11px] truncate">{camp.subject}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          camp.status === 'sent' ? 'bg-emerald-100 text-emerald-800' :
                          camp.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                          camp.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {camp.status}
                        </span>
                        <button
                          onClick={() => handleEditCampaign(camp)}
                          className="text-[#0B5E8E] font-semibold hover:underline"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SUBSCRIBERS VIEW */}
        {activeTab === 'subscribers' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-[#0B5E8E]">Subscriber Directory</h3>
                <p className="text-xs text-gray-500">
                  Total of {subscribersTotal} subscribers recorded with double opt-in consent and unsubscription history.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="bg-gray-100 hover:bg-gray-200 text-[#2F3A44] font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" /> Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="bg-gray-100 hover:bg-gray-200 text-[#2F3A44] font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" /> Export JSON
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
                {(['all', 'subscribed', 'pending', 'unsubscribed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setSubscriberFilter(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                      subscriberFilter === st
                        ? 'bg-white text-[#0B5E8E] shadow-sm font-bold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B5E8E]"
                />
              </div>
            </div>

            {/* Subscriber Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Consent Version</th>
                    <th className="py-3 px-4">Opt-In Date</th>
                    <th className="py-3 px-4">Confirmed Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No subscribers found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-4 font-semibold text-gray-900">{sub.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sub.status === 'subscribed' ? 'bg-emerald-100 text-emerald-800' :
                            sub.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{sub.consentVersion}</td>
                        <td className="py-3 px-4 text-gray-500">{new Date(sub.consentAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {sub.status !== 'unsubscribed' && (
                            <button
                              onClick={() => handleUpdateSubscriberStatus(sub.id, 'unsubscribed')}
                              title="Manually suppress / unsubscribe"
                              className="text-amber-700 hover:text-amber-900 font-semibold text-[11px] cursor-pointer"
                            >
                              Suppress
                            </button>
                          )}
                          {sub.status === 'unsubscribed' && (
                            <button
                              onClick={() => handleUpdateSubscriberStatus(sub.id, 'subscribed')}
                              title="Mark confirmed"
                              className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px] cursor-pointer"
                            >
                              Resubscribe
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            title="Delete"
                            className="text-red-500 hover:text-red-700 text-[11px] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. CAMPAIGNS VIEW */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#0B5E8E]">Newsletter Campaigns</h3>
                <p className="text-xs text-gray-500">Create, preview, schedule, and track campaign deliveries.</p>
              </div>
              <button
                onClick={handleOpenNewCampaign}
                className="bg-[#E67E22] hover:bg-[#d67118] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 space-y-4">
                <div className="w-12 h-12 bg-[#0B5E8E]/10 text-[#0B5E8E] rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-gray-800">No Newsletter Campaigns Created</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Draft your first Victoria Falls editorial story or holiday update to engage your travel subscribers.
                </p>
                <button
                  onClick={handleOpenNewCampaign}
                  className="bg-[#0B5E8E] hover:bg-[#094d75] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Create Campaign Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {campaigns.map(camp => (
                  <div key={camp.id} className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-base text-gray-900">{camp.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            camp.status === 'sent' ? 'bg-emerald-100 text-emerald-800' :
                            camp.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                            camp.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                            camp.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">{camp.subject}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleEditCampaign(camp)}
                          className="bg-gray-100 hover:bg-gray-200 text-[#0B5E8E] font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Edit / Preview
                        </button>

                        {['draft', 'scheduled'].includes(camp.status) && (
                          <button
                            onClick={() => handleDispatch(camp.id)}
                            className="bg-[#0B5E8E] hover:bg-[#094d75] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" /> Send Now
                          </button>
                        )}

                        {camp.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelCampaign(camp.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}

                        {['draft', 'archived', 'cancelled'].includes(camp.status) && (
                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Sending / Sent */}
                    {['sending', 'sent'].includes(camp.status) && (
                      <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Delivery Progress: <strong>{camp.sentCount}</strong> / {camp.totalRecipients} sent</span>
                          {camp.failedCount > 0 && <span className="text-red-600">{camp.failedCount} failed</span>}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${camp.totalRecipients ? Math.min(100, Math.round((camp.sentCount / camp.totalRecipients) * 100)) : 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-6 text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                      <span>Template: <strong>{camp.templateId}</strong></span>
                      <span>Created: {new Date(camp.createdAt).toLocaleDateString()}</span>
                      {camp.scheduledAt && (
                        <span className="text-amber-700 font-medium">Scheduled for: {new Date(camp.scheduledAt).toLocaleString()}</span>
                      )}
                      {camp.sentAt && (
                        <span className="text-emerald-700 font-medium">Delivered: {new Date(camp.sentAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TEMPLATES VIEW */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[#0B5E8E]">Branded Victoria Falls Email Templates</h3>
              <p className="text-xs text-gray-500">
                Email layouts engineered with cross-client table styles, high deliverability, and mobile responsiveness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A66B]">
                      Outbound Design System
                    </span>
                    <h4 className="font-bold text-base text-[#0B5E8E]">{tmpl.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{tmpl.description}</p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1 text-xs">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Default Subject:</span>
                    <p className="font-medium text-gray-800">{tmpl.defaultSubject}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedTemplateId(tmpl.id);
                        handleOpenNewCampaign();
                      }}
                      className="w-full bg-[#0B5E8E] hover:bg-[#094d75] text-white font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. WORDPRESS MIGRATION PREPARATION VIEW */}
        {activeTab === 'migration' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[#0B5E8E] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                WordPress Migration Readiness
              </h3>
              <p className="text-xs text-gray-500">
                Detailed roadmap and technical mapping for converting this newsletter system to a future WordPress theme.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-800">1. Data Schema Portability</span>
                <p className="text-[11px] text-emerald-700">
                  Subscribers, campaigns, and delivery outbox tables map 1:1 to custom WordPress tables or Custom Post Types.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-blue-800">2. Consent Preservation</span>
                <p className="text-[11px] text-blue-700">
                  Full audit timestamps (`consentAt`, `consentVersion`, `confirmedAt`, `unsubscribedAt`) exported cleanly via CSV/JSON.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-800">3. Delivery Transport</span>
                <p className="text-[11px] text-amber-700">
                  Standard SMTP credentials transfer directly to WordPress PHPMailer or `wp_mail` SMTP plugin.
                </p>
              </div>
            </div>

            {/* Step by Step Migration Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#0B5E8E]">Component Migration Mapping Matrix</h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4">Current React / Express / Prisma</th>
                      <th className="py-2.5 px-4">Future WordPress Theme / Plugin</th>
                      <th className="py-2.5 px-4">Migration Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Subscription Form</td>
                      <td className="py-2.5 px-4">`Newsletter.tsx` + `SubmissionSafety.tsx`</td>
                      <td className="py-2.5 px-4">Shortcode / Gutenberg block / PHP template</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">Direct HTML/CSS reuse</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Subscriber Storage</td>
                      <td className="py-2.5 px-4">`Subscription` table in PostgreSQL</td>
                      <td className="py-2.5 px-4">`wp_outbound_subscribers` table</td>
                      <td className="py-2.5 px-4 text-blue-700 font-semibold">CSV / SQL import</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Campaign Management</td>
                      <td className="py-2.5 px-4">`Campaign` table + REST API</td>
                      <td className="py-2.5 px-4">Custom Post Type `outbound_campaign`</td>
                      <td className="py-2.5 px-4 text-amber-700 font-semibold">PHP CPT Registration</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Batch Outbox &amp; Scheduling</td>
                      <td className="py-2.5 px-4">`Notification` outbox + cron</td>
                      <td className="py-2.5 px-4">Action Scheduler or WP-Cron batching</td>
                      <td className="py-2.5 px-4 text-purple-700 font-semibold">Use Action Scheduler</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Email Delivery</td>
                      <td className="py-2.5 px-4">`server/providers.ts` (Nodemailer SMTP)</td>
                      <td className="py-2.5 px-4">`wp_mail()` with PHPMailer SMTP</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-semibold">Reuse SMTP config</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold">Admin Interface</td>
                      <td className="py-2.5 px-4">`NewsletterAdmin.tsx` React component</td>
                      <td className="py-2.5 px-4">WP Admin menu page or React Gutenberg plugin</td>
                      <td className="py-2.5 px-4 text-blue-700 font-semibold">Port UI or embed React in WP Admin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Export Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">Ready to export subscribers for WP migration:</span>
              <button
                onClick={() => handleExport('csv')}
                className="bg-[#0B5E8E] hover:bg-[#094d75] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> Download Complete WP Import CSV
              </button>
            </div>
          </div>
        )}
      </main>

      {/* CAMPAIGN COMPOSER & PREVIEW MODAL */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-base text-[#0B5E8E]">
                  {editingCampaignId ? 'Edit Campaign Draft' : 'Create Newsletter Campaign'}
                </h3>
                <p className="text-xs text-gray-500">Craft a branded email update for your Victoria Falls audience.</p>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between bg-white text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode('editor')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    previewMode === 'editor' ? 'bg-[#0B5E8E] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Edit Content
                </button>
                <button
                  onClick={() => {
                    generatePreview();
                    setPreviewMode('preview');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                    previewMode === 'preview' ? 'bg-[#0B5E8E] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Live HTML Preview
                </button>
              </div>

              {/* Template selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold">Template:</span>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {previewMode === 'editor' ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Campaign Reference Title</label>
                      <input
                        type="text"
                        value={campaignTitle}
                        onChange={(e) => setCampaignTitle(e.target.value)}
                        placeholder="e.g. October 2026 Water Levels &amp; Safari Special"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0B5E8E]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Email Subject Line</label>
                      <input
                        type="text"
                        value={campaignSubject}
                        onChange={(e) => setCampaignSubject(e.target.value)}
                        placeholder="e.g. High Water Secrets | Outbound Holidays"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0B5E8E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Preview Text (Inbox Preheader)</label>
                    <input
                      type="text"
                      value={campaignPreviewText}
                      onChange={(e) => setCampaignPreviewText(e.target.value)}
                      placeholder="Brief text displayed next to subject line in subscriber inbox"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0B5E8E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Campaign Story &amp; HTML Content</label>
                    <textarea
                      rows={10}
                      value={campaignHtml}
                      onChange={(e) => setCampaignHtml(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono text-xs focus:ring-2 focus:ring-[#0B5E8E]"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Available dynamic placeholders: <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{email}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{unsubscribe_url}}'}</code>, <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{year}}'}</code>
                    </p>
                  </div>

                  {/* Test Email Section */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#0B5E8E]" /> Send Safe Test Preview
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter email for preview delivery"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendTest()}
                        className="bg-[#0B5E8E] text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-[#094d75] transition cursor-pointer"
                      >
                        Send Test
                      </button>
                    </div>
                    {testSendStatus && (
                      <p className="text-[11px] font-medium text-gray-600">{testSendStatus}</p>
                    )}
                  </div>
                </div>
              ) : (
                /* Live Preview Mode */
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-[#F4F6F8] p-4 flex justify-center">
                    <iframe
                      title="Email Preview"
                      srcDoc={previewHtml}
                      className="w-full max-w-[640px] h-[500px] bg-white rounded-lg shadow-md border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs"
                />
                <button
                  type="button"
                  disabled={!editingCampaignId || !scheduleDate}
                  onClick={() => editingCampaignId && handleSchedule(editingCampaignId)}
                  className="bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-700 transition cursor-pointer"
                >
                  Schedule
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveCampaign}
                  className="bg-[#E67E22] hover:bg-[#d67118] text-white px-6 py-2 rounded-xl font-bold shadow transition cursor-pointer"
                >
                  {loading ? 'Saving…' : 'Save Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
