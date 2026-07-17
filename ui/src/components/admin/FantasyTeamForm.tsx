import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api/client';
import { Search, Plus, Trash2, Shield, UserCheck, Wallet, Loader2 } from 'lucide-react';

interface AdminPlayer {
  id: number;
  name: string;
  position: string;
  team: string;
  auctionPrice?: number;
}

interface FantasyTeamFormProps {
  teamId?: string;
}

export default function FantasyTeamForm({ teamId }: FantasyTeamFormProps) {
  const navigate = useNavigate();

  const [users, setUsers] = useState<any[]>([]);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  
  const [teamName, setTeamName] = useState('My Team');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(1000);
  const [utilisation, setUtilisation] = useState<number>(0);
  
  const [squad, setSquad] = useState<any[]>([]); // { element, position, isStarting, isCaptain, isViceCaptain, positionIndex, auctionPrice }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
    if (teamId) {
      fetchTeam(teamId);
    } else {
      fetchPlayers();
    }
  }, [teamId]);

  const fetchTeam = async (id: string) => {
    try {
      const response = await api.get(`/admin/fantasy-teams/${id}`);
      const t = response.data.data;
      setTeamName(t.name);
      setSelectedUsers(t.managers?.map((m: any) => m._id) || []);
      if (t.finance) {
        setTotalBudget(t.finance.totalBudget || 1000);
        setUtilisation(t.finance.utilisation || 0);
      }
      
      // Hydrate squad
      if (t.currentSquad && t.currentSquad.picks) {
        const loadedSquad = t.currentSquad.picks.map((pick: any) => {
          const p = pick.playerId; // populated player
          return {
            element: p.id,
            position: p.position || 'Unknown',
            name: p.webName || p.name || 'Unknown',
            isStarting: pick.isStarting ?? false,
            subNumber: pick.subNumber ?? 0,
            isCaptain: pick.isCaptain,
            isViceCaptain: pick.isViceCaptain,
            auctionPrice: p.auctionPrice ?? 0
          };
        });
        
        // Fallback for older teams that don't have isStarting saved
        const hasStarting = loadedSquad.some((p: any) => p.isStarting);
        if (!hasStarting && loadedSquad.length > 0) {
          loadedSquad.forEach((p: any, i: number) => {
            p.isStarting = i < 11;
          });
        }

        setSquad(loadedSquad);
      }
      
      // Fetch players with excludeTeamId so current squad remains available
      fetchPlayers(id);
    } catch (err) {
      console.error('Failed to fetch team details:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchPlayers = async (excludeTeamId?: string) => {
    try {
      const endpoint = excludeTeamId 
        ? `/admin/players?excludeTeamId=${excludeTeamId}`
        : '/admin/players';
      const response = await api.get(endpoint);
      setPlayers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch players:', err);
    }
  };

  const handlePlayerToggle = (player: AdminPlayer) => {
    const existingIndex = squad.findIndex(p => p.element === player.id);
    if (existingIndex >= 0) {
      setSquad(squad.filter(p => p.element !== player.id));
      setError('');
    } else {
      if (squad.length >= 15) {
        setError('Maximum 15 players allowed.');
        return;
      }

      const normalizedPos = player.position.toUpperCase();
      const isGK = normalizedPos === 'GK' || normalizedPos === 'GOALKEEPER' || normalizedPos === 'G';
      const isDEF = normalizedPos === 'DEF' || normalizedPos === 'DEFENDER' || normalizedPos === 'D';
      const isMID = normalizedPos === 'MID' || normalizedPos === 'MIDFIELDER' || normalizedPos === 'M';
      const isFWD = normalizedPos === 'FWD' || normalizedPos === 'FORWARD' || normalizedPos === 'ATTACKER' || normalizedPos === 'A' || normalizedPos === 'F';
      
      const posCount = squad.filter(p => {
        const pNorm = p.position.toUpperCase();
        if (isGK) return pNorm === 'GK' || pNorm === 'GOALKEEPER' || pNorm === 'G';
        if (isDEF) return pNorm === 'DEF' || pNorm === 'DEFENDER' || pNorm === 'D';
        if (isMID) return pNorm === 'MID' || pNorm === 'MIDFIELDER' || pNorm === 'M';
        if (isFWD) return pNorm === 'FWD' || pNorm === 'FORWARD' || pNorm === 'ATTACKER' || pNorm === 'A' || pNorm === 'F';
        return false;
      }).length;

      if (isGK && posCount >= 2) {
        setError('Maximum 2 Goalkeepers allowed.');
        return;
      }
      if (isDEF && posCount >= 5) {
        setError('Maximum 5 Defenders allowed.');
        return;
      }
      if (isMID && posCount >= 5) {
        setError('Maximum 5 Midfielders allowed.');
        return;
      }
      if (isFWD && posCount >= 3) {
        setError('Maximum 3 Forwards allowed.');
        return;
      }

      setError('');
      setSquad([...squad, { 
        element: player.id, 
        position: player.position, 
        isStarting: false, 
        isCaptain: false, 
        isViceCaptain: false,
        name: player.name,
        subNumber: 0,
        auctionPrice: player.auctionPrice ?? 0
      }]);
    }
  };

  const updateSubNumber = (playerId: number, subNum: number) => {
    setSquad(squad.map(p => {
      if (p.element === playerId) {
        return { ...p, subNumber: subNum };
      }
      return p;
    }));
  };

  const toggleStarting = (playerId: number) => {
    setSquad(squad.map(p => {
      if (p.element === playerId) {
        return { ...p, isStarting: !p.isStarting };
      }
      return p;
    }));
  };

  const setCaptain = (playerId: number, type: 'captain' | 'vice') => {
    setSquad(squad.map(p => {
      if (p.element === playerId) {
        if (type === 'captain') return { ...p, isCaptain: true, isViceCaptain: false };
        if (type === 'vice') return { ...p, isViceCaptain: true, isCaptain: false };
      }
      if (type === 'captain' && p.isCaptain) return { ...p, isCaptain: false };
      if (type === 'vice' && p.isViceCaptain) return { ...p, isViceCaptain: false };
      return p;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (selectedUsers.length === 0) throw new Error('Please select at least one user');
      
      let currentPosIndex = 1;
      const sortedSquad = [...squad].sort((a, b) => {
        const getPosWeight = (pos: string) => {
          const p = pos.toUpperCase();
          if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') return 1;
          if (p === 'DEF' || p === 'DEFENDER' || p === 'D') return 2;
          if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') return 3;
          if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') return 4;
          return 5;
        };
        return getPosWeight(a.position) - getPosWeight(b.position);
      });
      const usedSubNumbers = new Set(squad.filter(p => !p.isStarting && p.subNumber).map(p => p.subNumber));
      let nextAvailableSub = 1;

      const finalSquad = sortedSquad.map(p => {
        if (p.isStarting) {
          return { ...p, positionIndex: currentPosIndex++, subNumber: 0 };
        }
        
        if (p.subNumber) {
          return { ...p, subNumber: p.subNumber };
        }
        
        while (usedSubNumbers.has(nextAvailableSub)) {
          nextAvailableSub++;
        }
        usedSubNumbers.add(nextAvailableSub);
        return { ...p, subNumber: nextAvailableSub };
      });

      const payload = {
        name: teamName,
        managers: selectedUsers,
        squad: finalSquad,
        finance: {
          totalBudget: Number(totalBudget),
          utilisation: Number(utilisation)
        }
      };

      if (teamId) {
        await api.put(`/admin/fantasy-teams/${teamId}`, payload);
        setSuccess('Fantasy team updated successfully!');
      } else {
        await api.post('/admin/fantasy-teams', payload);
        setSuccess('Fantasy team created successfully!');
        setTeamName('My Team');
        setSelectedUsers([]);
        setTotalBudget(1000);
        setUtilisation(0);
        setSquad([]);
      }
      
      setTimeout(() => {
        navigate({ to: '/admin/fantasy-teams' });
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const positionCounts = squad.reduce((acc, p) => {
    const pos = p.position.toUpperCase();
    let norm = '';
    if (pos === 'GK' || pos === 'GOALKEEPER' || pos === 'G') norm = 'GK';
    else if (pos === 'DEF' || pos === 'DEFENDER' || pos === 'D') norm = 'DEF';
    else if (pos === 'MID' || pos === 'MIDFIELDER' || pos === 'M') norm = 'MID';
    else if (pos === 'FWD' || pos === 'FORWARD' || pos === 'ATTACKER' || pos === 'A' || pos === 'F') norm = 'FWD';
    
    if (norm) {
      acc[norm] = (acc[norm] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const startingCount = squad.filter(p => p.isStarting).length;

  const uniqueTeams = Array.from(new Set(players.map(p => p.team))).filter(Boolean).sort();

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = teamFilter ? p.team === teamFilter : true;
    return matchesSearch && matchesTeam;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / itemsPerPage));
  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, teamFilter]);

  const remainingBalance = totalBudget - utilisation;

  return (
    <div className="w-full text-white">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-semibold mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-semibold mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Core Config Card */}
        <div className="bg-[#1b142d]/80 border border-white/10 p-4 rounded-xl shadow-lg space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Team Name Input */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1.5">
                Team Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500 pl-8"
                  required
                />
                <Shield className="w-4 h-4 text-white/40 absolute left-2.5 top-2" />
              </div>
            </div>

            {/* Managers Chip Selector with Search */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1.5">
                Managers
              </label>
              <div className="space-y-2 bg-[#150f24] border border-white/10 rounded-lg p-2.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 bg-[#1b142d] border border-white/10 rounded text-[10px] font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Search className="w-3 h-3 text-white/40 absolute left-2.5 top-2" />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {users
                    .filter((u: any) =>
                      u.username.toLowerCase().includes(userSearchTerm.toLowerCase())
                    )
                    .map((u: any) => {
                      const isSelected = selectedUsers.includes(u._id);
                      return (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedUsers(selectedUsers.filter((id) => id !== u._id));
                            } else {
                              setSelectedUsers([...selectedUsers, u._id]);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                              : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                          }`}
                        >
                          {isSelected && <UserCheck className="w-2.5 h-2.5 text-emerald-400" />}
                          {u.username}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

          </div>

          {/* Finance Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/5">
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Total Budget (M)
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Utilisation (M)
              </label>
              <input
                type="number"
                value={utilisation}
                onChange={(e) => setUtilisation(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="bg-[#150f24] border border-white/5 p-2 rounded-lg flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/40 flex items-center gap-1">
                  <Wallet className="w-2.5 h-2.5" /> Remaining Balance
                </span>
                <span className={`text-sm font-black tracking-tight ${remainingBalance < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {remainingBalance.toFixed(1)} M
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Squad Grid Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Available Players Pool */}
          <div className="bg-[#1b142d]/80 border border-white/10 rounded-xl p-4 h-[550px] flex flex-col shadow-lg">
            <div className="flex-none pb-3 border-b border-white/5 mb-3">
              <h3 className="text-xs font-extrabold text-white/50 uppercase tracking-widest mb-2">Available Players</h3>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search player name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
                </div>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="w-1/3 px-2 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#1b142d] text-white">All Teams</option>
                  {uniqueTeams.map(team => (
                    <option key={team} value={team} className="bg-[#1b142d] text-white">{team}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {paginatedPlayers.map(player => {
                const isAdded = squad.some(p => p.element === player.id);
                return (
                  <div key={player.id} className="flex items-center justify-between p-2.5 bg-[#150f24]/50 border border-white/5 rounded-xl transition-all">
                    <div>
                      <div className="font-bold text-xs text-white/95">{player.name}</div>
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-white/40 mt-0.5">
                        {player.team} • <span className="text-indigo-400">{player.position}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayerToggle(player)}
                      className={`text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                        isAdded
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                      }`}
                    >
                      {isAdded ? 'Remove' : <><Plus className="w-3 h-3" /> Add</>}
                    </button>
                  </div>
                );
              })}
              {paginatedPlayers.length === 0 && (
                <div className="text-center text-white/30 py-12 text-xs">No players found</div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex-none flex justify-between items-center pt-3 mt-3 border-t border-white/5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Selected Squad List */}
          <div className="bg-[#1b142d]/80 border border-white/10 rounded-xl p-4 h-[550px] flex flex-col shadow-lg">
            <div className="flex-none pb-3 border-b border-white/5 mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-white/50 uppercase tracking-widest">Selected Squad ({squad.length}/15)</h3>
                <div className="text-[9px] font-extrabold uppercase tracking-wider text-white/40 flex gap-2 mt-1">
                  <span className={positionCounts['GK'] === 2 ? 'text-emerald-400 font-bold' : ''}>GK: {positionCounts['GK'] || 0}/2</span>
                  <span className={positionCounts['DEF'] === 5 ? 'text-emerald-400 font-bold' : ''}>DEF: {positionCounts['DEF'] || 0}/5</span>
                  <span className={positionCounts['MID'] === 5 ? 'text-emerald-400 font-bold' : ''}>MID: {positionCounts['MID'] || 0}/5</span>
                  <span className={positionCounts['FWD'] === 3 ? 'text-emerald-400 font-bold' : ''}>FWD: {positionCounts['FWD'] || 0}/3</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">Lineup Starting</span>
                <div className={`text-xs font-black tracking-tight ${startingCount === 11 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {startingCount}/11 XI
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {squad.map(p => (
                <div key={p.element} className="p-3 bg-[#150f24]/50 border border-white/5 rounded-xl transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-bold text-xs text-white/95">{p.name}</span>
                      <span className="ml-2 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/60">{p.position}</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setCaptain(p.element, 'captain')}
                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-md transition-all ${p.isCaptain ? 'bg-yellow-500 text-white shadow shadow-yellow-500/40' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'}`}
                        title="Captain"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => setCaptain(p.element, 'vice')}
                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-md transition-all ${p.isViceCaptain ? 'bg-blue-500 text-white shadow shadow-blue-500/40' : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/10'}`}
                        title="Vice Captain"
                      >
                        V
                      </button>
                      <button
                        type="button"
                        onClick={() => setSquad(squad.filter(s => s.element !== p.element))}
                        className="w-6 h-6 flex items-center justify-center rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                        title="Remove Player"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-white/5 justify-between">
                    <label className="flex items-center text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors shrink-0">
                      <input
                        type="checkbox"
                        checked={p.isStarting}
                        onChange={() => toggleStarting(p.element)}
                        className="mr-2 w-4.5 h-4.5 rounded border-white/20 text-indigo-500 focus:ring-indigo-500 bg-black/20"
                      />
                      Starting XI
                    </label>

                    {/* Auction Price Option */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-text-secondary uppercase">Price:</span>
                      <input
                        type="number"
                        value={p.auctionPrice ?? ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSquad(squad.map(sq => sq.element === p.element ? { ...sq, auctionPrice: isNaN(val) ? 0 : val } : sq));
                        }}
                        className="w-16 px-2 py-1 bg-black/20 border border-white/10 rounded-lg text-xs font-bold text-text-primary text-center outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {!p.isStarting && (
                      <label className="flex items-center text-xs font-semibold text-text-secondary gap-1.5 shrink-0">
                        Sub Rank:
                        <select 
                          value={p.subNumber || 0}
                          onChange={(e) => updateSubNumber(p.element, parseInt(e.target.value))}
                          className="text-xs px-2 py-1 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary cursor-pointer"
                        >
                          <option value={0} className="bg-[#1b142d] text-white">Auto</option>
                          <option value={1} className="bg-[#1b142d] text-white">1 (GK)</option>
                          <option value={2} className="bg-[#1b142d] text-white">2</option>
                          <option value={3} className="bg-[#1b142d] text-white">3</option>
                          <option value={4} className="bg-[#1b142d] text-white">4</option>
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              ))}
              {squad.length === 0 && (
                <div className="text-center text-white/30 py-12 text-xs">No players selected</div>
              )}
            </div>
          </div>

        </div>

        {/* Submit Form Controls */}
        <div className="flex justify-end pt-3 gap-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/fantasy-teams' })}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || squad.length !== 15 || startingCount !== 11}
            className="px-5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-bold shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1.5"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Saving...' : teamId ? 'Update Team' : 'Create Team'}
          </button>
        </div>

      </form>
    </div>
  );
}
