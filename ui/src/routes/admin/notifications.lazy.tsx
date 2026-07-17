import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import { Send, Bell, Loader2, Calendar, Target } from "lucide-react";

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
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      
      {/* Dense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Bell className="w-5 h-5 text-indigo-400" />
            Admin Notifications
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Manage and view push notification history
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send Notification
        </button>
      </div>
      
      {/* Notifications List */}
      <div className="bg-[#150f24]/50 border border-white/5 p-4 rounded-xl shadow-lg space-y-3">
        <h2 className="text-xs font-extrabold text-white/50 uppercase tracking-widest">
          Recent Notifications
        </h2>
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-[#150f24]/30 rounded-xl border border-white/5">
            <p className="text-white/40 text-xs">No notifications sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: any, i: number) => (
              <div 
                key={notif._id} 
                className="bg-[#1b142d]/80 rounded-xl p-3.5 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-xs text-white/95">
                    {notif.title}
                  </h3>
                  <p className="text-[11px] text-white/60 leading-normal whitespace-pre-wrap">
                    {notif.message}
                  </p>
                </div>
                
                <div className="flex sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(notif.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {notif.targetType && (
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                      <Target className="w-2.5 h-2.5" />
                      Target: {notif.targetType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <form 
            onSubmit={handleSendNotification} 
            className="bg-[#1b142d] border border-white/10 p-5 rounded-2xl shadow-2xl space-y-4 relative overflow-hidden w-full max-w-sm animate-slide-up z-10 text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80" />
            
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                New Notification
              </h2>
              <button 
                type="button" 
                onClick={closeModal}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>
            
            {status.message && (
              <div className={`p-2.5 rounded-lg text-[10px] font-bold shadow-sm transition-all ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {status.message}
              </div>
            )}

            <div className="space-y-3.5">
              
              {/* Target Selector Badges */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'user', 'team'].map((type) => {
                    const isSelected = targetType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setTargetType(type as any);
                          setTargetId("");
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                            : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        }`}
                      >
                        {type === 'all' ? 'All Users' : `Specific ${type}`}
                      </button>
                    );
                  })}
                </div>
                
                {targetType === 'user' && (
                  <div className="animate-fade-in mt-1.5">
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-white text-xs font-semibold cursor-pointer"
                      required
                    >
                      <option value="" disabled className="bg-[#1b142d] text-white/50">Select a User</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id} className="bg-[#1b142d] text-white">
                          {user.username} {user.email ? `(${user.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'team' && (
                  <div className="animate-fade-in mt-1.5">
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-white text-xs font-semibold cursor-pointer"
                      required
                    >
                      <option value="" disabled className="bg-[#1b142d] text-white/50">Select a Fantasy Team</option>
                      {teams.map(team => (
                        <option key={team._id} value={team._id} className="bg-[#1b142d] text-white">
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Title Field */}
              <div className="space-y-1">
                <label htmlFor="title" className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
                  Notification Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-white text-xs font-semibold"
                  placeholder="e.g. Gameweek 5 is now open!"
                />
              </div>
              
              {/* Message Body Field */}
              <div className="space-y-1">
                <label htmlFor="body" className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
                  Message Body
                </label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-white text-xs font-semibold resize-none"
                  placeholder="Enter the notification message here..."
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/5">
              <button
                type="button"
                onClick={closeModal}
                disabled={status.type === 'loading'}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="px-5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {status.type === 'loading' ? (
                  <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</span>
                ) : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
