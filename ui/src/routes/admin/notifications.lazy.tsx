import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/endpoints";

export const Route = createLazyFileRoute("/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading' });
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.NOTIFICATION.SEND}`,
        { payload: { title, body } },
        { withCredentials: true }
      );
      setStatus({ type: 'success', message: 'Notification sent successfully!' });
      setTitle("");
      setBody("");
      setTimeout(() => setStatus({ type: 'idle' }), 3000);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send notification' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Admin Notifications
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Send push notifications to all subscribed users
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSendNotification} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
        <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">
          New Notification
        </h2>
        
        {status.message && (
          <div className={`p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {status.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              placeholder="e.g. Gameweek 5 is now open!"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="body" className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
              Message Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              placeholder="Enter the notification message here..."
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
          >
            {status.type === 'loading' ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}
