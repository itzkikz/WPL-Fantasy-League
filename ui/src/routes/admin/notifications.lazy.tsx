import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";

export const Route = createLazyFileRoute("/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<'all' | 'user' | 'team'>('all');
  const [targetId, setTargetId] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, teamsRes, notifsRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.ADMIN.USERS),
        apiClient.get(API_ENDPOINTS.ADMIN.FANTASY_TEAMS),
        apiClient.get(API_ENDPOINTS.NOTIFICATION.BASE)
      ]);
      setUsers(usersRes.data?.data || []);
      setTeams(teamsRes.data?.data || []);
      setNotifications(notifsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetType !== 'all' && !targetId) {
      setStatus({ type: 'error', message: 'Please select a specific target' });
      return;
    }

    setStatus({ type: 'loading' });
    try {
      await apiClient.post(
        API_ENDPOINTS.NOTIFICATION.SEND,
        { targetType, targetId, payload: { title, body } }
      );
      setStatus({ type: 'success', message: 'Notification sent successfully!' });
      setTitle("");
      setBody("");
      setTargetType('all');
      setTargetId("");
      fetchData(); // Refresh list after sending
      
      setTimeout(() => {
        setStatus({ type: 'idle' });
        setIsModalOpen(false); // Close modal on success
      }, 1500);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to send notification' });
    }
  };

  const closeModal = () => {
    if (status.type === 'loading') return;
    setIsModalOpen(false);
    setStatus({ type: 'idle' });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            Admin Notifications
          </h1>
          <p className="text-[var(--color-text-secondary)] font-medium text-lg">
            Manage and view push notification history
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-primary)] text-[var(--color-bg)] px-8 py-3.5 rounded-full font-black shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 transition-all hover:-translate-y-1 active:translate-y-0 whitespace-nowrap"
        >
          + Send Notification
        </button>
      </div>
      
      {/* Notifications List */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-lg transition-interactive">
        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight mb-8">
          Recent Notifications
        </h2>
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-[var(--color-bg)] rounded-2xl border border-dashed border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] font-medium">No notifications sent yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any, i: number) => (
              <div 
                key={notif._id} 
                className="bg-[var(--color-bg)] rounded-2xl p-5 border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors group animate-slide-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="flex justify-between items-start mb-3 gap-4">
                  <h3 className="font-bold text-[var(--color-text-primary)] text-lg group-hover:text-[var(--color-primary)] transition-colors">
                    {notif.title}
                  </h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] bg-[var(--color-surface)] px-3 py-1.5 rounded-lg whitespace-nowrap">
                    {new Date(notif.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap font-medium">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={closeModal}
          />
          <form 
            onSubmit={handleSendNotification} 
            className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden w-full max-w-2xl animate-slide-up z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Subtle accent gradient decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] opacity-80" />
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                New Notification
              </h2>
              <button 
                type="button" 
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            
            {status.message && (
              <div className={`p-4 rounded-xl text-sm font-bold shadow-sm transition-all ${status.type === 'success' ? 'bg-[#00CC6B]/10 text-[#00CC6B] border border-[#00CC6B]/20' : 'bg-[#D0004A]/10 text-[#D0004A] border border-[#D0004A]/20'}`}>
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4">
                <label className="block text-[11px] font-extrabold tracking-widest text-[var(--color-text-secondary)] uppercase">
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-4">
                  {['all', 'user', 'team'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group p-2 pr-4 rounded-xl hover:bg-[var(--color-bg)] transition-colors border border-transparent hover:border-[var(--color-border)]">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${targetType === type ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)] group-hover:border-[var(--color-text-secondary)]'}`}>
                        {targetType === type && <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />}
                      </div>
                      <span className={`text-sm font-bold capitalize transition-colors ${targetType === type ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                        {type === 'all' ? 'All Users' : `Specific ${type}`}
                      </span>
                      <input
                        type="radio"
                        name="targetType"
                        value={type}
                        checked={targetType === type}
                        onChange={(e) => {
                          setTargetType(e.target.value as any);
                          setTargetId("");
                        }}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
                
                {targetType === 'user' && (
                  <div className="animate-fade-in mt-2">
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] font-semibold shadow-inner appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled className="text-[var(--color-text-secondary)]">Select a User</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.username} {user.email ? `(${user.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'team' && (
                  <div className="animate-fade-in mt-2">
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] font-semibold shadow-inner appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled className="text-[var(--color-text-secondary)]">Select a Fantasy Team</option>
                      {teams.map(team => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label htmlFor="title" className="block text-[11px] font-extrabold tracking-widest text-[var(--color-text-secondary)] uppercase">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] font-semibold shadow-inner"
                  placeholder="e.g. Gameweek 5 is now open!"
                />
              </div>
              
              <div className="space-y-3">
                <label htmlFor="body" className="block text-[11px] font-extrabold tracking-widest text-[var(--color-text-secondary)] uppercase">
                  Message Body
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] font-semibold shadow-inner resize-y"
                  placeholder="Enter the notification message here..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={status.type === 'loading'}
                className="bg-[var(--color-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)] px-8 py-3.5 rounded-full font-black shadow-sm hover:border-[var(--color-text-secondary)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="bg-[var(--color-primary)] text-[var(--color-bg)] px-10 py-3.5 rounded-full font-black shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
              >
                {status.type === 'loading' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
