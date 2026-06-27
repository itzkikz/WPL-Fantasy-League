import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";

export const Route = createLazyFileRoute("/admin/fixtures")({
  component: AdminFixtures,
});

function AdminFixtures() {
  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FIXTURES],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.FIXTURES);
      return response.data;
    },
  });

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.post(API_ENDPOINTS.ADMIN.UPDATE_FIXTURES);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS] });
      alert("Fixtures updated successfully!");
    },
    onError: () => {
      alert("Failed to update fixtures. Check API key and logs.");
    }
  });

  const detailsMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.post(API_ENDPOINTS.ADMIN.FETCH_MATCH_DETAILS(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
      alert("Match details saved successfully!");
    },
    onError: () => {
      alert("Failed to fetch match details. Check logs.");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-4xl mx-auto mt-8">
        Failed to load fixtures. Please try again.
      </div>
    );
  }

  const fixtures = data?.data || [];

  // Group fixtures by date
  const groupedFixtures = fixtures.reduce((acc: Record<string, any[]>, fixture: any) => {
    const dateStr = fixture.fixture.date;
    const dateKey = dayjs(dateStr).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(fixture);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedFixtures).sort();

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Admin Fixtures
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Manage and view all upcoming and past fixtures
          </p>
        </div>
        <button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Updating..." : "Update Fixtures"}
        </button>
      </div>

      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[2px] bg-indigo-500 rounded-full"></div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>
            
            <div className="grid gap-4">
              {groupedFixtures[date].map((item: any) => {
                const f = item.fixture;
                const teams = item.teams;
                const goals = item.goals;
                
                return (
                  <div
                    key={f.id}
                    className="bg-white/5 backdrop-blur-md dark:bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all group flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden"
                  >
                    {/* Time & Status */}
                    <div className="flex flex-col items-center sm:items-start min-w-[100px]">
                      <span className="text-2xl font-black tracking-tighter text-text-primary">
                        {dayjs(f.date).format("HH:mm")}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mt-2 shadow-sm ${f.status.short === 'FT' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}`}>
                        {f.status.short}
                      </span>
                    </div>

                    {/* Teams & Score */}
                    <div className="flex-1 flex items-center justify-center w-full gap-4">
                      {/* Home Team */}
                      <div className="flex-1 flex items-center justify-end gap-3">
                        <span className="font-medium text-text-primary text-right hidden sm:block">
                          {teams.home.name}
                        </span>
                        <span className="font-medium text-text-primary text-right sm:hidden">
                          {teams.home.name.substring(0, 3).toUpperCase()}
                        </span>
                        <img
                          src={teams.home.logo}
                          alt={teams.home.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      {/* Score or VS */}
                      <div className="px-5 py-2 bg-black/20 dark:bg-black/40 rounded-full border border-white/5 min-w-[90px] flex justify-center items-center font-black text-2xl tracking-widest text-text-primary shadow-inner">
                        {goals.home !== null && goals.away !== null ? (
                          `${goals.home} - ${goals.away}`
                        ) : (
                          <span className="text-xs font-bold text-text-secondary">VS</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center justify-start gap-3">
                        <img
                          src={teams.away.logo}
                          alt={teams.away.name}
                          className="w-8 h-8 object-contain"
                        />
                        <span className="font-medium text-text-primary hidden sm:block">
                          {teams.away.name}
                        </span>
                        <span className="font-medium text-text-primary sm:hidden">
                          {teams.away.name.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Venue info (hidden on mobile, visible on lg) */}
                    <div className="hidden lg:flex flex-col items-end min-w-[150px] text-right">
                      <span className="text-sm font-medium text-text-primary">
                        {f.venue.name}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {f.venue.city}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end w-full sm:w-auto mt-4 sm:mt-0 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
                      <button
                        onClick={() => detailsMutation.mutate(f.id)}
                        disabled={f.status.short !== 'FT' || item.hasDetails || !item.hasGameweek || (detailsMutation.isPending && detailsMutation.variables === f.id)}
                        className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all whitespace-nowrap shadow-sm ${
                          item.hasDetails 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed'
                            : !item.hasGameweek
                            ? 'bg-black/10 dark:bg-white/5 text-text-secondary border border-white/5 cursor-not-allowed opacity-70'
                            : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50'
                        }`}
                        title={!item.hasGameweek ? "Assign this fixture to a gameweek first" : ""}
                      >
                        {detailsMutation.isPending && detailsMutation.variables === f.id 
                          ? 'Loading...' 
                          : item.hasDetails 
                            ? 'Details Saved' 
                            : !item.hasGameweek
                            ? 'No Gameweek'
                            : 'Get Match Details'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {fixtures.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <p className="text-text-secondary">No fixtures found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
