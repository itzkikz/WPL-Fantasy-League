import GameweekTeamView from "@/components/GameweekTeamView";

export default function TeamPage({ params }: { params: { teamName: string } }) {
  const { teamName } = params;

  return (
    <main className="min-h-screen bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
      <div className="flex h-screen flex-col mx-auto max-w-md bg-white shadow-sm">
        <GameweekTeamView teamName={decodeURIComponent(teamName)} />
      </div>
    </main>
  );
}
