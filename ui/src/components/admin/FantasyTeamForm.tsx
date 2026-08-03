import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api/client';
import { Search, Plus, Trash2, Shield, UserCheck, Wallet, Loader2, ImagePlus, X } from 'lucide-react';
import Modal from '../common/Modal';

function normalizePos(pos: string): string {
  const p = (pos || '').toUpperCase();
  if (p === 'GK' || p === 'GOALKEEPER' || p === 'G') return 'GK';
  if (p === 'DEF' || p === 'DEFENDER' || p === 'D') return 'DEF';
  if (p === 'MID' || p === 'MIDFIELDER' || p === 'M') return 'MID';
  if (p === 'FWD' || p === 'FORWARD' || p === 'ATTACKER' || p === 'A' || p === 'F') return 'FWD';
  return '';
}

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
  const isEditMode = !!teamId;

  const [users, setUsers] = useState<any[]>([]);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [adminTeams, setAdminTeams] = useState<{ id: number; name: string }[]>([]);
  
  const [teamName, setTeamName] = useState('My Team');
  const [logo, setLogo] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(1000);
  const [utilisation, setUtilisation] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  const [fine, setFine] = useState<number>(0);
  
  const [squad, setSquad] = useState<any[]>([]); // { element, position, isStarting, isCaptain, isViceCaptain, positionIndex, auctionPrice }

  const [loading, setLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pendingPlayer, setPendingPlayer] = useState<AdminPlayer | null>(null);
  const [modalPosition, setModalPosition] = useState('MID');
  const [modalAuctionPrice, setModalAuctionPrice] = useState('');
  const [savingPlayer, setSavingPlayer] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const loadedFor = useRef<string | symbol>(Symbol.for('fantasy-team-not-loaded'));

  useEffect(() => {
    // Guard against React StrictMode double-invoking effects in dev
    const key = teamId ?? null;
    if (loadedFor.current === key) return;
    loadedFor.current = key;

    fetchUsers(teamId);
    fetchTeams();
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId]);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/admin/teams');
      const teams = (response.data.data || [])
        .filter((t: any) => !t.national && !t.disabled && (t.playerCount || 0) > 0)
        .map((t: any) => ({ id: t.id, name: t.name }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
      setAdminTeams(teams);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  // Debounced server-side search
  useEffect(() => {
    setCurrentPage(1);
    const tid = adminTeams.find(t => t.name === teamFilter)?.id;
    const t = setTimeout(() => {
      fetchPlayers(teamId, 1, searchTerm, tid);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, teamId, teamFilter, adminTeams]);

  const fetchTeam = async (id: string) => {
    setTeamLoading(true);
    try {
      const response = await api.get(`/admin/fantasy-teams/${id}`);
      const t = response.data.data;
      setTeamName(t.name);
      setLogo(t.logo || '');
      setSelectedUsers(t.managers?.map((m: any) => m._id) || []);
      if (t.finance) {
        setTotalBudget(t.finance.totalBudget || 1000);
        setUtilisation(t.finance.utilisation || 0);
        setBonus(t.finance.bonus || 0);
        setFine(t.finance.fine || 0);
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
      
    } catch (err) {
      console.error('Failed to fetch team details:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchUsers = async (excludeTeamId?: string) => {
    setUsersLoading(true);
    try {
      const endpoint = excludeTeamId
        ? `/admin/users?excludeTeamId=${excludeTeamId}`
        : '/admin/users';
      const response = await api.get(endpoint);
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPlayers = async (excludeTeamId?: string, page = 1, search = '', teamFilterId?: number) => {
    setPlayersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
      if (excludeTeamId) params.set('excludeTeamId', excludeTeamId);
      if (search) params.set('search', search);
      if (teamFilterId) params.set('teamId', String(teamFilterId));
      const response = await api.get(`/admin/players?${params.toString()}`);
      setPlayers(response.data.data);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch players:', err);
    } finally {
      setPlayersLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('Logo must be under 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 256;
        let { width, height } = img;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setLogo(reader.result as string);
          setError('');
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        setLogo(canvas.toDataURL('image/png'));
        setError('');
      };
      img.onerror = () => {
        setError('Could not read the selected image.');
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogoRemove = () => {
    setLogo('');
  };

  const removeFromSquad = (player: AdminPlayer) => {
    setSquad(squad.filter(p => p.element !== player.id));
    setError('');
    api.put(`/admin/players/${player.id}`, { auctionPrice: null }).catch((err) => {
      console.error('Failed to reset player auction price:', err);
    });
  };

  const handlePlayerToggle = (player: AdminPlayer) => {
    const existingIndex = squad.findIndex(p => p.element === player.id);
    if (existingIndex >= 0) {
      removeFromSquad(player);
    } else {
      if (squad.length >= 15) {
        setError('Maximum 15 players allowed.');
        return;
      }
      const defaultPos = normalizePos(player.position) || 'MID';
      setModalPosition(defaultPos);
      setModalAuctionPrice(player.auctionPrice ? String(player.auctionPrice) : '');
      setPendingPlayer(player);
    }
  };

  const confirmAddPlayer = async () => {
    if (!pendingPlayer) return;

    const pos = normalizePos(modalPosition);
    const price = parseFloat(modalAuctionPrice);

    if (!pos) {
      setError('Please select a position.');
      return;
    }
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid auction price.');
      return;
    }

    const posCount = squad.filter(p => normalizePos(p.position) === pos).length;
    const limits: Record<string, number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
    if (posCount >= limits[pos]) {
      setError(`Maximum ${limits[pos]} ${pos} players allowed.`);
      return;
    }

    setSavingPlayer(true);
    setError('');
    try {
      await api.put(`/admin/players/${pendingPlayer.id}`, {
        position: pos,
        tm_position: pos,
        auctionPrice: price,
      });
      setSquad([...squad, {
        element: pendingPlayer.id,
        position: pos,
        isStarting: false,
        isCaptain: false,
        isViceCaptain: false,
        name: pendingPlayer.name,
        subNumber: 0,
        auctionPrice: price,
      }]);
      setPendingPlayer(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update player');
    } finally {
      setSavingPlayer(false);
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
        logo,
        managers: selectedUsers,
        squad: finalSquad,
        finance: {
          totalBudget: Number(totalBudget),
          utilisation: Number(utilisation),
          bonus: Number(bonus),
          fine: Number(fine)
        }
      };

      if (teamId) {
        await api.put(`/admin/fantasy-teams/${teamId}`, payload);
        setSuccess('Fantasy team updated successfully!');
      } else {
        await api.post('/admin/fantasy-teams', payload);
        setSuccess('Fantasy team created successfully!');
        setTeamName('My Team');
        setLogo('');
        setSelectedUsers([]);
        setTotalBudget(1000);
        setUtilisation(0);
        setBonus(0);
        setFine(0);
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

  const teamIdNumber = adminTeams.find(t => t.name === teamFilter)?.id;
  const uniqueTeams = adminTeams.map(t => t.name).filter(Boolean).sort();

  const visiblePlayers = players.filter(p => (teamFilter ? p.team === teamFilter : true));

  const remainingBalance = totalBudget - utilisation + bonus - fine;

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

        {/* Edit mode: team details (left) + current squad (right) */}
        <div className={isEditMode ? "grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4" : "space-y-4"}>

        {/* Core Config Card */}
        <div className="bg-[#1b142d]/80 border border-white/10 p-4 rounded-xl shadow-lg space-y-4 h-full">

          {isEditMode && teamLoading && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading team data...
            </div>
          )}
          
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

            {/* Team Logo Upload */}
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1.5">
                Team Logo
              </label>
              <div className="flex items-center gap-3 bg-[#150f24] border border-white/10 rounded-lg p-2.5">
                <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-black/30 border border-white/10 flex items-center justify-center">
                  {logo ? (
                    <img src={logo} alt="Team logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-5 h-5 text-white/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="inline-block cursor-pointer text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
                    Upload Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  <p className="text-[9px] text-white/35 mt-1">PNG/JPG up to 500KB, auto-resized & stored as base64</p>
                </div>
                {logo && (
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    title="Remove logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
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
                  {usersLoading && (
                    <div className="w-full flex items-center gap-1.5 text-[10px] font-bold text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading users...
                    </div>
                  )}
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
          <div className="flex flex-wrap gap-4 pt-3 border-t border-white/5">
            <div className="flex-1 min-w-[120px]">
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
            <div className="flex-1 min-w-[120px]">
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
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] font-extrabold tracking-widest text-emerald-400/70 uppercase mb-1">
                Bonus (M)
              </label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-emerald-500"
                min="0"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] font-extrabold tracking-widest text-rose-400/70 uppercase mb-1">
                Fine (M)
              </label>
              <input
                type="number"
                value={fine}
                onChange={(e) => setFine(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-rose-500"
                min="0"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1 flex items-center gap-1">
                <Wallet className="w-2.5 h-2.5" /> Remaining Balance
              </label>
              <div className={`w-full px-3 py-1.5 bg-[#150f24] border rounded-lg text-xs font-bold whitespace-nowrap ${remainingBalance < 0 ? 'text-rose-400 border-rose-500/30 animate-pulse' : 'text-emerald-400 border-white/10'}`}>
                {remainingBalance.toFixed(1)} M
              </div>
            </div>
          </div>

        </div>

        {/* Squad Grid Selection */}
        <div className={`grid grid-cols-1 gap-4 ${isEditMode ? "" : "lg:grid-cols-2"}`}>
          
          {/* Available Players Pool (hidden in edit mode — squad is read-only) */}
          {!isEditMode && <div className="bg-[#1b142d]/80 border border-white/10 rounded-xl p-4 h-[550px] flex flex-col shadow-lg">
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
              {playersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : visiblePlayers.length === 0 ? (
                <div className="text-center text-white/30 py-12 text-xs">No players found</div>
              ) : (
              visiblePlayers.map(player => {
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
              })
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex-none flex justify-between items-center pt-3 mt-3 border-t border-white/5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    const p = Math.max(1, currentPage - 1);
                    setCurrentPage(p);
                    fetchPlayers(teamId, p, searchTerm, teamIdNumber);
                  }}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    const p = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(p);
                    fetchPlayers(teamId, p, searchTerm, teamIdNumber);
                  }}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>}

          {/* Selected Squad List */}
          <div className="bg-[#1b142d]/80 border border-white/10 rounded-xl p-4 h-[550px] flex flex-col shadow-lg">
            <div className="flex-none pb-3 border-b border-white/5 mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-white/50 uppercase tracking-widest">
                  {isEditMode ? `Current Squad (${squad.length}/15)` : `Selected Squad (${squad.length}/15)`}
                </h3>
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
                      {isEditMode && (
                        <span className="ml-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded text-white/70 border border-white/10">
                          {p.auctionPrice ? `${p.auctionPrice} M` : 'Unpriced'}
                        </span>
                      )}
                    </div>
                    {isEditMode ? (
                      <div className="flex gap-1 shrink-0">
                        {p.isCaptain && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[9px] font-black">C</span>
                        )}
                        {p.isViceCaptain && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-black">V</span>
                        )}
                        {p.isStarting ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black">XI</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px] font-black">SUB {p.subNumber || ''}</span>
                        )}
                      </div>
                    ) : (
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
                          onClick={() => removeFromSquad({ id: p.element, name: p.name, position: p.position, auctionPrice: p.auctionPrice })}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                          title="Remove Player"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {!isEditMode && (
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
                  )}
                </div>
              ))}
              {squad.length === 0 && (
                <div className="text-center text-white/30 py-12 text-xs">No players selected</div>
              )}
            </div>
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

      {/* Player Config Modal */}
      <Modal
        isOpen={!!pendingPlayer}
        onClose={() => { if (!savingPlayer) setPendingPlayer(null); }}
        maxWidthClass="max-w-sm"
      >
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-black tracking-tight text-white">Add Player</h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mt-0.5">
              {pendingPlayer?.name}
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1.5">
              Position <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['GK', 'DEF', 'MID', 'FWD'].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setModalPosition(pos)}
                  className={`py-2 rounded-lg text-[11px] font-black border transition-all ${
                    modalPosition === pos
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.12)]'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1.5">
              Auction Price (M) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              value={modalAuctionPrice}
              onChange={(e) => setModalAuctionPrice(e.target.value)}
              placeholder="e.g. 12.5"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg text-xs font-semibold text-white outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            <p className="text-[9px] text-white/35 mt-1">
              Updates the player's auction price, position & tm_position in the players collection.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setPendingPlayer(null)}
              disabled={savingPlayer}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmAddPlayer}
              disabled={savingPlayer}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-bold shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:transform-none flex items-center justify-center gap-1.5"
            >
              {savingPlayer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {savingPlayer ? 'Adding...' : 'Add to Squad'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
