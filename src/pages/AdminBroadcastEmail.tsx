import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AdminBroadcastEmail: React.FC = () => {
  const { currentUser, token } = useAuth();
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [templateMode, setTemplateMode] = useState<'raw' | 'builder'>('builder');

  // Determine the correct POST URL for the broadcast endpoint.
  // Some setups set VITE_API_URL to include the '/api' prefix, others don't.
  const resolveBroadcastUrl = async (base: string) => {
    const sanitized = base.replace(/\/$/, '');
    const candidates = [
      `${sanitized}/admin/broadcast-email`,
      `${sanitized}/api/admin/broadcast-email`,
    ];

    // To avoid sending emails during detection, we'll probe the admin 'users' GET
    // endpoint which is safe and already used elsewhere in the app.
    const probeCandidates = [
      `${sanitized}/admin/users`,
      `${sanitized}/api/admin/users`,
    ];

    for (let i = 0; i < probeCandidates.length; i++) {
      try {
        const probeUrl = probeCandidates[i];
        const probeRes = await axios.get(probeUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (probeRes.status === 200) {
          return candidates[i];
        }
      } catch (err) {
        // ignore probe errors and try next
      }
    }

    // Fallback: return the first candidate
    return candidates[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !token) {
      toast.error('Authentication required.');
      return;
    }
    if (!subject.trim() || !html.trim()) {
      toast.error('Please provide both subject and message body.');
      return;
    }

    setLoading(true);
    try {
      const postUrl = await resolveBroadcastUrl(API_BASE || '');
      console.debug('Broadcast POST URL resolved to:', postUrl);

      const response = await axios.post(postUrl, { subject, html }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(response.data?.message || 'Broadcast sent.');
    } catch (err: any) {
      console.error('Broadcast error:', err?.response?.data || err.message);
      // If server returned HTML (Express 404), include the text in the toast for debugging
      const serverMessage =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err.message;
      toast.error(serverMessage || 'Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = (template: string) => {
    setHtml(html + template);
  };

  return (
    <div className="max-w-4xl mx-auto mt-28 mb-8 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-3xl font-bold mb-2">Broadcast Email to Users</h2>
      <p className="text-sm text-gray-600 mb-6">Compose a professional broadcast email. This will be sent to all users (respecting admin batch limits).</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Subject</label>
          <input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="e.g., Important Update from Grad Managers"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm" 
          />
        </div>

        {/* Template/Raw Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTemplateMode('builder')}
            className={`px-4 py-2 rounded-lg font-medium transition ${templateMode === 'builder' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            📝 Template Builder
          </button>
          <button
            type="button"
            onClick={() => setTemplateMode('raw')}
            className={`px-4 py-2 rounded-lg font-medium transition ${templateMode === 'raw' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            💻 Raw HTML
          </button>
        </div>

        {/* Template Builder Mode */}
        {templateMode === 'builder' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3">Quick Inserts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => insertTemplate('<h2>Heading</h2>')}
                  className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition"
                >
                  + Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<p>Your text here...</p>')}
                  className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition"
                >
                  + Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>')}
                  className="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200 transition"
                >
                  + List
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<div class="highlight-box"><p><strong>Important:</strong> Your highlight text here</p></div>')}
                  className="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200 transition"
                >
                  + Highlight
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<blockquote>Your quote here...</blockquote>')}
                  className="px-3 py-2 bg-orange-100 text-orange-700 text-sm rounded hover:bg-orange-200 transition"
                >
                  + Quote
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<p><a href="https://example.com" class="cta-button">Call to Action</a></p>')}
                  className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition"
                >
                  + Button
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<hr class="divider">')}
                  className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition"
                >
                  + Divider
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('<p class="text-muted">Small text with muted color</p>')}
                  className="px-3 py-2 bg-gray-400 text-gray-700 text-sm rounded hover:bg-gray-500 transition"
                >
                  + Muted Text
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Body</label>
              <textarea 
                value={html} 
                onChange={(e) => setHtml(e.target.value)} 
                rows={12} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm font-mono text-sm" 
                placeholder="Start typing or use the quick insert buttons above. The email will be wrapped with professional formatting automatically." 
              />
              <p className="text-xs text-gray-500 mt-2">💡 Tip: Use the quick insert buttons or write HTML directly. Available CSS classes: highlight-box, cta-button, text-center, text-muted</p>
            </div>
          </div>
        )}

        {/* Raw HTML Mode */}
        {templateMode === 'raw' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Raw HTML Body</label>
            <textarea 
              value={html} 
              onChange={(e) => setHtml(e.target.value)} 
              rows={15} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm font-mono text-sm" 
              placeholder="Paste your complete HTML here. It will be wrapped with a professional email template." 
            />
            <p className="text-xs text-gray-500 mt-2">Your HTML will be automatically wrapped in a professional email template with proper formatting.</p>
          </div>
        )}

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📧 Email Preview</h3>
          <div className="bg-white p-4 rounded border border-gray-300 max-h-60 overflow-y-auto text-sm text-gray-700">
            {subject ? <p><strong>Subject:</strong> {subject}</p> : <p className="text-gray-400">Subject will appear here...</p>}
            <hr className="my-2" />
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html.substring(0, 200) }} className="text-xs" />
            ) : (
              <p className="text-gray-400">Body will appear here...</p>
            )}
            {html && html.length > 200 && <p className="text-gray-400 text-xs mt-2">... (truncated for preview)</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => { setSubject(''); setHtml(''); }} 
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Clear
          </button>
          <button 
            type="submit" 
            disabled={loading || !subject.trim() || !html.trim()} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? '⏳ Sending...' : '📤 Send Broadcast'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBroadcastEmail;
