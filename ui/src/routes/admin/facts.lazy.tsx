import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, Sparkles, Image as ImageIcon, Tag } from "lucide-react";
import Modal from "../../components/common/Modal";

export const Route = createLazyFileRoute("/admin/facts")({
  component: AdminFacts,
});

interface FactItem {
  _id: string;
  headline: string;
  content?: string;
  category: string;
  imageUrl?: string;
  isPublished: boolean;
  order?: number;
  createdAt?: string;
}

function AdminFacts() {
  const [facts, setFacts] = useState<FactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFact, setEditingFact] = useState<FactItem | null>(null);
  const [factToDelete, setFactToDelete] = useState<FactItem | null>(null);

  // Form State
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Trivia");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });

  const fetchFacts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API_ENDPOINTS.ADMIN.FACTS);
      setFacts(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch facts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacts();
  }, []);

  const openCreateModal = () => {
    setEditingFact(null);
    setHeadline("");
    setContent("");
    setCategory("Trivia");
    setImageUrl("");
    setIsPublished(true);
    setStatus({ type: "idle" });
    setIsModalOpen(true);
  };

  const openEditModal = (fact: FactItem) => {
    setEditingFact(fact);
    setHeadline(fact.headline);
    setContent(fact.content || "");
    setCategory(fact.category || "Trivia");
    setImageUrl(fact.imageUrl || "");
    setIsPublished(fact.isPublished);
    setStatus({ type: "idle" });
    setIsModalOpen(true);
  };

  const handleSaveFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) {
      setStatus({ type: "error", message: "Headline is required" });
      return;
    }

    setSaving(true);
    setStatus({ type: "idle" });

    try {
      const payload = { headline, content, category, imageUrl, isPublished };
      if (editingFact) {
        await apiClient.put(API_ENDPOINTS.ADMIN.FACT(editingFact._id), payload);
        setStatus({ type: "success", message: "Fact updated successfully!" });
      } else {
        await apiClient.post(API_ENDPOINTS.ADMIN.FACTS, payload);
        setStatus({ type: "success", message: "Fact created successfully!" });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchFacts();
      }, 500);
    } catch (err: any) {
      console.error("Error saving fact:", err);
      setStatus({ type: "error", message: err.response?.data?.error || "Failed to save fact" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFact = async () => {
    if (!factToDelete) return;
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.FACT(factToDelete._id));
      setIsDeleteModalOpen(false);
      setFactToDelete(null);
      fetchFacts();
    } catch (err) {
      console.error("Error deleting fact:", err);
    }
  };

  const handleTogglePublish = async (fact: FactItem) => {
    try {
      await apiClient.put(API_ENDPOINTS.ADMIN.FACT(fact._id), {
        isPublished: !fact.isPublished,
      });
      fetchFacts();
    } catch (err) {
      console.error("Error toggling publish status:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface p-5 rounded-2xl border border-border/60 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" /> Facts & Fantasy News
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Create, manage, and publish trivia facts and fantasy news displayed on the home page UI.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Fact
        </button>
      </div>

      {/* Facts Table / List */}
      <div className="bg-surface rounded-2xl border border-border/60 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-sm font-medium">Loading facts & news...</p>
          </div>
        ) : facts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 mx-auto text-text-muted opacity-50" />
            <p className="text-text-secondary font-medium">No facts created yet.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 text-xs font-bold transition-all"
            >
              + Create First Fact
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {facts.map((fact) => (
              <div
                key={fact._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {fact.imageUrl ? (
                    <img
                      src={fact.imageUrl}
                      alt={fact.headline}
                      className="w-14 h-14 rounded-xl object-cover border border-border/60 shrink-0 bg-background"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                        {fact.category}
                      </span>
                      <button
                        onClick={() => handleTogglePublish(fact)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                          fact.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
                        }`}
                      >
                        {fact.isPublished ? (
                          <>
                            <Eye className="w-3 h-3" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" /> Draft
                          </>
                        )}
                      </button>
                    </div>
                    <h3 className="text-text-primary font-bold text-sm sm:text-base leading-snug">
                      {fact.headline}
                    </h3>
                    {fact.content && (
                      <p className="text-text-secondary text-xs line-clamp-2 leading-relaxed">
                        {fact.content}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(fact)}
                    className="p-2 rounded-xl bg-background border border-border/50 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    title="Edit Fact"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setFactToDelete(fact);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete Fact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFact ? "Edit Fact / News" : "Create New Fact / News"}
      >
        <form onSubmit={handleSaveFact} className="space-y-4 pt-2">
          {status.type === "error" && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {status.message}
            </div>
          )}
          {status.type === "success" && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {status.message}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Headline *</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Haaland hat-trick fires Man City to big win"
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-text-primary text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-text-primary text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Trivia">Trivia</option>
                <option value="Match News">Match News</option>
                <option value="Injury Update">Injury Update</option>
                <option value="Differential Pick">Differential Pick</option>
                <option value="Tactical">Tactical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Image Thumbnail URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-text-primary text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Content / Description</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide detailed information or trivia about this fact..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border/60 text-text-primary text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40">
            <div>
              <p className="text-xs font-bold text-text-primary">Publish Status</p>
              <p className="text-[11px] text-text-muted">Immediately make this visible in Fantasy News on Home Page</p>
            </div>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-background border border-border/60 text-text-secondary hover:text-text-primary text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingFact ? "Update Fact" : "Create Fact"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete <strong className="text-text-primary">{factToDelete?.headline}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-background border border-border/60 text-text-secondary hover:text-text-primary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteFact}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Delete Fact
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
