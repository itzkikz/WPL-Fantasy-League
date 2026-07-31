import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import apiClient from "../../api/client";
import { transfersApi } from "../../features/transfers/api";
import { Transfer, TransferInput, TransferSquadPick, FreeAgentPlayer } from "../../features/transfers/types";
import {
  ArrowLeftRight,
  UserMinus,
  UserPlus,
  Search,
  Calendar,
  Loader2,
  Undo2,
  Zap,
  Shield,
  RotateCcw,
  Check,
} from "lucide-react";

export const Route = createLazyFileRoute("/admin/transfers")({
  component: AdminTransfers,
});

const todayISO = () => new Date().toISOString().slice(0, 10);

const tmPositions = ["F", "M", "D", "G"];

const posColor = (pos: string) => {
  switch (pos) {
    case "GK": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "DEF": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "MID": return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    case "FWD": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    default: return "text-white/50 bg-white/5 border-white/10";
  }
};

function AdminTransfers() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["admin", "fantasy-teams"],
    queryFn: async () => (await apiClient.get("/admin/fantasy-teams")).data.data,
  });

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ["admin", "fantasy-team", selectedTeamId],
    queryFn: async () => (await apiClient.get(`/admin/fantasy-teams/${selectedTeamId}`)).data.data,
    enabled: !!selectedTeamId,
  });

  const { data: gameweeksData, isLoading: gameweeksLoading } = useQuery({
    queryKey: ["admin", "gameweeks"],
    queryFn: async () => (await apiClient.get("/admin/gameweeks")).data.data,
  });

  // Form state
  const [operation, setOperation] = useState<"swap" | "release" | "sign">("swap");
  const [playerOutId, setPlayerOutId] = useState<number | "">("");
  const [playerInId, setPlayerInId] = useState<number | "">("");
  const [playerInSearch, setPlayerInSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [playerInAuctionPrice, setPlayerInAuctionPrice] = useState("");
  const [playerInTmPosition, setPlayerInTmPosition] = useState("");
  const [gameweek, setGameweek] = useState<number | "">("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(playerInSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [playerInSearch]);

  useEffect(() => {
    if (gameweek === "" && gameweeksData?.length) {
      const cur = gameweeksData.find((g: any) => g.isCurrent);
      if (cur) setGameweek(cur.number);
    }
  }, [gameweeksData, gameweek]);

  const squadPlayers: TransferSquadPick[] = useMemo(() => {
    const picks = teamData?.currentSquad?.picks || [];
    return picks.map((pick: any) => ({
      playerId: pick.playerId?.id ?? pick.playerId,
      name: pick.playerId?.name || pick.playerId?.webName || "Unknown Player",
      position: pick.playerId?.position || "Unknown",
      auctionPrice: pick.playerId?.auctionPrice ?? null,
      isCaptain: pick.isCaptain,
      isViceCaptain: pick.isViceCaptain,
      isStarting: pick.isStarting,
      subNumber: pick.subNumber,
    }));
  }, [teamData]);

  const { data: freeAgentsRes, isLoading: freeAgentsLoading } = useQuery({
    queryKey: ["admin", "players", "transfer-in", debouncedSearch],
    queryFn: async () =>
      (await apiClient.get("/admin/players", { params: { search: debouncedSearch || undefined, limit: 50 } })).data,
    enabled: operation !== "release",
  });
  const freeAgents: FreeAgentPlayer[] = freeAgentsRes?.data || [];

  const resetForm = () => {
    setOperation("swap");
    setPlayerOutId("");
    setPlayerInId("");
    setPlayerInSearch("");
    setPlayerInAuctionPrice("");
    setPlayerInTmPosition("");
    setNote("");
    setFormError(null);
  };

  const createMutation = useMutation({
    mutationFn: (data: TransferInput) => transfersApi.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "fantasy-team"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "players"] });
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err?.response?.data?.error || "Failed to create transfer");
    },
  });

  const reverseMutation = useMutation({
    mutationFn: (id: string) => transfersApi.reverseTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "fantasy-team"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "players"] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || "Failed to reverse transfer");
    },
  });

  // History filters
  const [filterTeam, setFilterTeam] = useState("");
  const [filterGw, setFilterGw] = useState<number | "">("");
  const { data: transfers, isLoading: transfersLoading, isFetching: transfersFetching } = useQuery({
    queryKey: ["admin", "transfers", filterTeam, filterGw],
    queryFn: async () =>
      transfersApi.getTransfers({ teamId: filterTeam || undefined, gameweek: filterGw || undefined }),
  });

  const handleSubmit = () => {
    setFormError(null);
    createMutation.mutate({
      fantasyTeamId: selectedTeamId,
      type: operation,
      playerOutId: playerOutId === "" ? null : playerOutId,
      playerInId: playerInId === "" ? null : playerInId,
      playerInAuctionPrice:
        operation === "sign" && playerInAuctionPrice !== "" ? Number(playerInAuctionPrice) : undefined,
      playerInTmPosition: operation === "sign" && playerInTmPosition.trim() !== "" ? playerInTmPosition.trim() : undefined,
      gameweek: gameweek === "" ? undefined : gameweek,
      date: date || undefined,
      note: note || undefined,
    });
  };

  const canSubmit =
    !!selectedTeamId &&
    ((operation === "swap" && playerOutId !== "" && playerInId !== "") ||
      (operation === "release" && playerOutId !== "") ||
      (operation === "sign" && playerInId !== ""));

  const operations = [
    { key: "swap", label: "Swap", icon: ArrowLeftRight },
    { key: "release", label: "Release", icon: UserMinus },
    { key: "sign", label: "Sign", icon: UserPlus },
  ] as const;

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-3">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
          <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
          Transfers
        </h1>
        <p className="text-[11px] text-white/50 font-medium">
          Record offline transfers · swaps, releases & free-agent signings
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs font-bold text-rose-400">
          {error}
        </div>
      )}

      {/* Create Transfer */}
      <div className="rounded-xl border border-white/10 bg-[#1b142d]/80 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-black text-white tracking-wide">Record Transfer</h2>
            <p className="text-[11px] text-white/50 font-medium">
              Past gameweek history stays frozen — changes apply to the live squad
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#150f24] border border-white/10 self-start sm:self-auto">
            {operations.map((op) => (
              <button
                key={op.key}
                onClick={() => {
                  setOperation(op.key);
                  setPlayerOutId("");
                  setPlayerInId("");
                  setPlayerInAuctionPrice("");
                  setPlayerInTmPosition("");
                  setFormError(null);
                }}
                className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  operation === op.key
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <op.icon className="w-3.5 h-3.5" /> {op.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Fantasy Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setPlayerOutId("");
                  setPlayerInId("");
                  setFormError(null);
                }}
                className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select team</option>
                {teamsData?.map((t: any) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              {teamsLoading && !teamsData && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-white/40">
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> Loading teams...
                </p>
              )}
            </div>

            {selectedTeamId && teamData && (
              <>
                {operation !== "sign" && (
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                      Player Out
                    </label>
                    <select
                      value={playerOutId}
                      onChange={(e) => setPlayerOutId(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-rose-500"
                    >
                      <option value="">Select player to release</option>
                      {squadPlayers.map((p) => (
                        <option key={p.playerId} value={p.playerId}>
                          {p.name} ({p.position}){p.isCaptain ? " · C" : ""}{p.isViceCaptain ? " · VC" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {operation !== "release" && (
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                      Player In
                    </label>
                    <div className="relative mb-1.5">
                      <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-white/30" />
                      <input
                        value={playerInSearch}
                        onChange={(e) => {
                          setPlayerInSearch(e.target.value);
                          setPlayerInId("");
                        }}
                        placeholder="Search free agents..."
                        className="w-full pl-8 pr-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-[#150f24] p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {freeAgentsLoading ? (
                        <div className="py-6 flex justify-center">
                          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                        </div>
                      ) : freeAgents.length === 0 ? (
                        <p className="text-[10px] text-white/40 text-center py-4 italic">No free agents found.</p>
                      ) : (
                        freeAgents.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPlayerInId(p.id)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                              playerInId === p.id
                                ? "bg-indigo-500/20 border border-indigo-500/30"
                                : "hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${posColor(p.position)}`}>
                                {p.position}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-xs text-white/90 font-semibold truncate">{p.name}</span>
                                {p.tmPosition ? (
                                  <span className="block text-[8px] font-bold uppercase tracking-wider text-white/30 truncate">
                                    {p.tmPosition}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              <span className="text-[9px] text-white/40">{p.team}</span>
                              <span className="text-[10px] font-bold text-emerald-400">
                                {p.auctionPrice != null ? `${p.auctionPrice} M` : "—"}
                              </span>
                              {playerInId === p.id && <Check className="w-3 h-3 text-indigo-400" />}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {operation === "sign" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                        tm_position
                      </label>
                      <select
                        value={playerInTmPosition}
                        onChange={(e) => setPlayerInTmPosition(e.target.value)}
                        className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="">Select position...</option>
                        {tmPositions.map((pos) => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                        Auction Price (M)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={playerInAuctionPrice}
                        onChange={(e) => setPlayerInAuctionPrice(e.target.value)}
                        placeholder="e.g. 12.5"
                        className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                      Gameweek
                      {gameweeksLoading && (
                        <Loader2 className="inline w-3 h-3 animate-spin text-indigo-400 ml-1.5" />
                      )}
                    </label>
                    <select
                      value={gameweek}
                      onChange={(e) => setGameweek(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">GW</option>
                      {gameweeksData?.map((g: any) => (
                        <option key={g._id} value={g.number}>
                          GW {g.number}{g.isCurrent ? " (Current)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                    Note
                  </label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note e.g. cash + player deal"
                    className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {formError && <p className="text-[10px] font-bold text-rose-400">{formError}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || createMutation.isPending}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 text-xs font-black transition-all shadow-md hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Apply {operation === "swap" ? "Swap" : operation === "release" ? "Release" : "Signing"}
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Squad preview */}
          <div>
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
              Current Squad {squadPlayers.length > 0 && `(${squadPlayers.length}/15)`}
            </label>
            <div className="rounded-xl border border-white/10 bg-[#150f24] p-2.5">
              {teamLoading ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : squadPlayers.length === 0 ? (
                <p className="text-[10px] text-white/40 text-center py-6 italic">Select a team to preview its squad.</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {squadPlayers.map((p) => {
                    const isOut = p.playerId === playerOutId;
                    return (
                      <div
                        key={p.playerId}
                        className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] ${
                          isOut ? "border-rose-500/40 bg-rose-500/10" : "border-white/5 bg-white/[0.02]"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span className={`px-1 py-0.5 rounded text-[8px] font-black shrink-0 ${posColor(p.position)}`}>
                            {p.position}
                          </span>
                          <span className="font-semibold text-white/85 truncate">{p.name}</span>
                          {p.isCaptain && <Shield className="w-3 h-3 text-amber-400 shrink-0" />}
                          {p.isViceCaptain && <Shield className="w-3 h-3 text-sky-400 shrink-0" />}
                        </span>
                        <span className="text-[9px] font-bold text-white/40 shrink-0">
                          {p.auctionPrice != null ? `${p.auctionPrice}M` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer History */}
      <div className="rounded-xl border border-white/10 bg-[#1b142d]/80 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-indigo-400" /> Transfer History
            {transfers?.length ? (
              <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-md">{transfers.length}</span>
            ) : null}
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Teams</option>
              {teamsData?.map((t: any) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <select
              value={filterGw}
              onChange={(e) => setFilterGw(e.target.value === "" ? "" : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All GWs</option>
              {gameweeksData?.map((g: any) => (
                <option key={g._id} value={g.number}>GW {g.number}</option>
              ))}
            </select>
          </div>
        </div>

        {transfersLoading || transfersFetching ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-xs font-semibold">No transfers recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {transfers.map((t: Transfer) => (
              <div key={t._id} className="rounded-lg border border-white/5 bg-[#150f24]/40 p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-white/40 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> {dayjs(t.date).format("DD MMM YYYY")}
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">GW {t.gameweek}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                        t.type === "swap"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : t.type === "release"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {t.type === "swap" ? "Swap" : t.type === "release" ? "Release" : "Sign"}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Reverse this ${t.type} and delete the record?`)) reverseMutation.mutate(t._id);
                      }}
                      disabled={reverseMutation.isPending}
                      className="px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider text-white/50 hover:text-white border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Undo2 className="w-3 h-3 inline mr-1" /> Reverse
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-xs font-extrabold text-white/90 truncate">
                      {t.playerOut?.name || <span className="text-white/30">—</span>}
                    </p>
                    <p className="text-[9px] text-white/40">
                      {t.playerOut
                        ? `${t.playerOut.position}${t.playerOut.tmPosition ? ` · ${t.playerOut.tmPosition}` : ""}${t.playerOut.auctionPrice != null ? ` · ${t.playerOut.auctionPrice} M` : ""}`
                        : "Free agent"}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center px-2">
                    <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/30">{t.teamName}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-extrabold text-white/90 truncate">
                      {t.playerIn?.name || <span className="text-white/30">—</span>}
                    </p>
                    <p className="text-[9px] text-white/40">
                      {t.playerIn
                        ? `${t.playerIn.position}${t.playerIn.tmPosition ? ` · ${t.playerIn.tmPosition}` : ""}${t.playerIn.auctionPrice != null ? ` · ${t.playerIn.auctionPrice} M` : ""}`
                        : "—"}
                    </p>
                  </div>
                </div>
                {t.note && <p className="mt-1.5 text-[10px] text-white/40 italic truncate">"{t.note}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
