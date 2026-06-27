import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api/client';

interface AdminPlayer {
  id: number;
  name: string;
  position: string;
  team: string;
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
  
  const [squad, setSquad] = useState<any[]>([]); // { element, position, isStarting, isCaptain, isViceCaptain, positionIndex }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId]);

  const fetchTeam = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/fantasy-teams/${id}`);
      const t = res.data.data;
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
            isViceCaptain: pick.isViceCaptain
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
    } catch (err) {
      console.error('Failed to fetch team:', err);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPlayers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await api.get(`/admin/players${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
      setPlayers(res.data.data);
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
        subNumber: 0
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
      
      // Navigate back to list after a short delay
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

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-bold tracking-wide text-text-secondary uppercase mb-2">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold tracking-wide text-text-secondary uppercase mb-2">Assign to Users</label>
            <select
              multiple
              value={selectedUsers}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedUsers(options);
              }}
              className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner h-32"
              required
            >
              {users.map(u => (
                <option key={u._id} value={u._id} className="py-1">{u.username} ({u.email})</option>
              ))}
            </select>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-2">Hold Ctrl/Cmd to select multiple</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <label className="block text-sm font-bold tracking-wide text-text-secondary uppercase mb-2">Total Budget</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold tracking-wide text-text-secondary uppercase mb-2">Utilisation</label>
            <input
              type="number"
              value={utilisation}
              onChange={(e) => setUtilisation(Number(e.target.value))}
              className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              required
            />
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-4">
          <h2 className="text-2xl font-black mb-6 text-text-primary tracking-tight">Squad Selection</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Pool */}
            <div className="bg-black/10 dark:bg-black/20 border border-white/5 rounded-2xl p-5 h-[600px] flex flex-col shadow-inner">
              <div className="flex-none pb-4 border-b border-white/10 mb-4">
                <h3 className="font-bold text-lg mb-3 text-text-primary">Available Players</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-text-primary"
                  />
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-text-primary"
                  >
                    <option value="">All Teams</option>
                    {uniqueTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {paginatedPlayers.map(player => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all mb-2 group">
                    <div>
                      <div className="font-bold text-text-primary">{player.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-1">{player.team} • {player.position}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayerToggle(player)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all shadow-sm ${squad.find(p => p.element === player.id) ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 opacity-0 group-hover:opacity-100 focus:opacity-100'}`}
                    >
                      {squad.find(p => p.element === player.id) ? 'Remove' : 'Add'}
                    </button>
                  </div>
                ))}
                {paginatedPlayers.length === 0 && (
                  <div className="text-center text-text-secondary py-10 font-medium">No players found</div>
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="flex-none flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-full disabled:opacity-50 text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-full disabled:opacity-50 text-text-secondary hover:bg-white/5 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Selected Squad */}
            <div className="bg-black/10 dark:bg-black/20 border border-white/5 rounded-2xl p-5 h-[600px] overflow-y-auto shadow-inner relative custom-scrollbar">
              <div className="sticky top-0 bg-bg/95 backdrop-blur-md pb-4 z-10 border-b border-white/10 mb-4 -mx-5 px-5 -mt-5 pt-5">
                <h3 className="font-bold text-lg text-text-primary">Selected Squad ({squad.length}/15)</h3>
                <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary flex gap-3 mt-2">
                  <span className={positionCounts['GK'] === 2 ? 'text-green-500' : ''}>GK: {positionCounts['GK'] || 0}/2</span>
                  <span className={positionCounts['DEF'] === 5 ? 'text-green-500' : ''}>DEF: {positionCounts['DEF'] || 0}/5</span>
                  <span className={positionCounts['MID'] === 5 ? 'text-green-500' : ''}>MID: {positionCounts['MID'] || 0}/5</span>
                  <span className={positionCounts['FWD'] === 3 ? 'text-green-500' : ''}>FWD: {positionCounts['FWD'] || 0}/3</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-1">
                  <span className={startingCount === 11 ? 'text-green-500' : 'text-red-500'}>Starting XI: {startingCount}/11</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {squad.map(p => (
                  <div key={p.element} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-bold text-text-primary text-lg">{p.name}</span>
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 rounded-full text-text-secondary">{p.position}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCaptain(p.element, 'captain')}
                          className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-full transition-all shadow-sm ${p.isCaptain ? 'bg-yellow-500 text-white shadow-yellow-500/30' : 'bg-white/10 text-text-secondary hover:bg-white/20'}`}
                        >
                          C
                        </button>
                        <button
                          type="button"
                          onClick={() => setCaptain(p.element, 'vice')}
                          className={`w-8 h-8 flex items-center justify-center text-xs font-black rounded-full transition-all shadow-sm ${p.isViceCaptain ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-white/10 text-text-secondary hover:bg-white/20'}`}
                        >
                          V
                        </button>
                        <button
                          type="button"
                          onClick={() => setSquad(squad.filter(s => s.element !== p.element))}
                          className="w-8 h-8 flex items-center justify-center text-xs font-black rounded-full transition-all shadow-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-3 pt-3 border-t border-white/5">
                      <label className="flex items-center text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={p.isStarting}
                          onChange={() => toggleStarting(p.element)}
                          className="mr-3 w-4 h-4 rounded border-white/20 text-indigo-500 focus:ring-indigo-500 bg-black/20"
                        />
                        Starting XI
                      </label>
                      {!p.isStarting && (
                        <label className="flex items-center text-sm font-medium text-text-secondary gap-3">
                          Sub Rank:
                          <select 
                            value={p.subNumber || 0}
                            onChange={(e) => updateSubNumber(p.element, parseInt(e.target.value))}
                            className="text-sm px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-text-primary"
                          >
                            <option value={0}>Auto</option>
                            <option value={1}>1 (GK usually)</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                          </select>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                {squad.length === 0 && (
                  <div className="text-center text-text-secondary py-10 font-medium">
                    No players selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8 gap-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate({ to: '/admin/fantasy-teams' })}
            className="px-6 py-2.5 rounded-full font-bold text-text-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || squad.length !== 15 || startingCount !== 11}
            className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Saving...' : teamId ? 'Update Fantasy Team' : 'Create Fantasy Team'}
          </button>
        </div>
      </form>
    </div>
  );
}
