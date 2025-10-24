// app/components/LeagueTableTable.tsx
"use client";

import { useRouter } from "next/navigation";

type Team = {
  pos: number;
  delta: "up" | "down" | "same";
  team: string;
  manager: string;
  gw: number;
  total: number;
};

const data: Team[] = [
  {
    pos: 1,
    delta: "same",
    team: "Havertz Word Ref",
    manager: "Dan Day",
    gw: 72,
    total: 631,
  },
  {
    pos: 2,
    delta: "up",
    team: "saka nuts",
    manager: "lucas clarke",
    gw: 98,
    total: 621,
  },
  {
    pos: 3,
    delta: "down",
    team: "Arsenal",
    manager: "Nick Roth",
    gw: 70,
    total: 620,
  },
  {
    pos: 4,
    delta: "up",
    team: "Real Badmen Fc",
    manager: "Travis Murira",
    gw: 73,
    total: 617,
  },
  {
    pos: 5,
    delta: "up",
    team: "فريق الاحلام",
    manager: "اللأيسنو هدية",
    gw: 104,
    total: 616,
  },
  {
    pos: 6,
    delta: "up",
    team: "Saliba the solution",
    manager: "Jacob Davis",
    gw: 86,
    total: 615,
  },
  {
    pos: 7,
    delta: "same",
    team: "BomboStars",
    manager: "Johan Larpes",
    gw: 71,
    total: 614,
  },
  {
    pos: 8,
    delta: "up",
    team: "HavertzYourWay",
    manager: "Joel Rogers",
    gw: 94,
    total: 613,
  },
  {
    pos: 8,
    delta: "up",
    team: "simpletons",
    manager: "Riley Althaus",
    gw: 84,
    total: 613,
  },
  {
    pos: 5,
    delta: "up",
    team: "فريق الاحلام",
    manager: "اللأيسنو هدية",
    gw: 104,
    total: 616,
  },
  {
    pos: 6,
    delta: "up",
    team: "Saliba the solution",
    manager: "Jacob Davis",
    gw: 86,
    total: 615,
  },
  {
    pos: 7,
    delta: "same",
    team: "BomboStars",
    manager: "Johan Larpes",
    gw: 71,
    total: 614,
  },
  {
    pos: 8,
    delta: "up",
    team: "HavertzYourWay",
    manager: "Joel Rogers",
    gw: 94,
    total: 613,
  },
  {
    pos: 8,
    delta: "up",
    team: "simpletons",
    manager: "Riley Althaus",
    gw: 84,
    total: 613,
  },
];

function Delta({ d }: { d: Team["delta"] }) {
  if (d === "up")
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2fa550] text-white">
        <svg
          className="w-3 h-3 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 8"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"
          />
        </svg>
      </span>
    );
  if (d === "down")
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#ed0628] text-white">
        <svg
          className="w-3 h-3 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 8"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
          />
        </svg>
      </span>
    );
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-gray-600"></span>
  );
}

export default function LeagueTable({ data }: { data: Team[] }) {
  const router = useRouter();


  const handleRowClick = (team: string) => {
    router.push(`/team/${encodeURIComponent(team)}`);
  };

  return (
    <>
      <header className="relative w-full h-16 overflow-hidden">
        {/* Animated gradient overlay */}
        {/* Content container */}
        <div className="relative z-10 flex items-center h-full px-4 max-w-md mx-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
          {/* Premier League Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center shadow-md">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                <circle cx="20" cy="25" r="8" fill="#00FF87" />
              </svg>
            </div>

            {/* Fantasy Text */}
            <h1 className="text-white text-2xl font-bold tracking-tight">
              WPL Fantasy Football
            </h1>
          </div>
        </div>

        {/* Decorative wave pattern */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-40">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path
              d="M0,100 Q50,80 100,100 T200,100 L200,200 L0,200 Z"
              fill="url(#wave-gradient)"
              className="animate-wave"
            />
            <defs>
              <linearGradient
                id="wave-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#00ff87" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#60efff" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </header>
      {/* Fixed header */}
      <div className="flex-none bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        {/* <h2 className="text-center text-2xl font-semibold text-[#33003b]">
          Arsenal
        </h2> */}
        <p className="mt-2 text-xs text-gray-600 text-center">
          Last updated: <b>Monday 20 Oct at 00:42</b>(Local Time)
        </p>
      </div>

      {/* Scrollable table container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            {/* Sticky table header */}
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-4 py-3 w-24">
                  Rank
                </th>
                <th className="text-left text-xs font-semibold text-gray-600 px-2 py-3">
                  Team & Manager
                </th>
                <th className="text-center text-xs font-semibold text-gray-600 px-2 py-3 w-16">
                  GW
                </th>
                <th className="text-right text-xs font-semibold text-gray-600 px-4 py-3 w-20">
                  Total
                </th>
              </tr>
            </thead>

            {/* Scrollable tbody */}
            <tbody>
              {data.map((r, i) => (
                <tr
                  key={i}
                  className="even:bg-gray-50 hover:bg-purple-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(r.team)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center text-xs text-black font-semibold">
                        {i+1}
                      </span>
                      <Delta d={r.delta} />
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <p className="text-[15px] font-semibold text-[#2a1134] leading-tight">
                      {r.team}
                    </p>
                    <p className="text-xs text-gray-500">{"Manager"}</p>
                  </td>
                  <td className="px-2 py-3 text-center font-semibold text-[#2a1134]">
                    {r.gw}
                  </td>
                  <td className="px-4 py-3 text-right text-base font-semibold text-[#4a2b59]">
                    {r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
  );
}
