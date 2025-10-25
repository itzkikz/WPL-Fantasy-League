/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import {
  fetchRecords,
} from "@/lib/api";
import LeagueTable from "../components/LeagueTable";
import Loader from "../components/Loader";

interface Record {
  total: number;
  [key: string]: any;
}

export default function Home() {
  const [data, setData] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchRecords();
      if (result.data && result.data.length > 0) {
        const sortedData = result.data.sort((a: Record, b: Record) => b.total - a.total);
        setData(sortedData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };





  return (
    <main className="min-h-screen bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen flex-col mx-auto max-w-md bg-white shadow-sm">
          {/* Data Table */}
          {loading ? (
            <Loader />
          ) : (
            <LeagueTable data={data as any} />
            // <GameweekTeamView />
          )}
          {/* Fixed bottom navigation */}
          <nav className="flex-none border-t border-gray-200 bg-white hidden">
            <div className="grid h-16 grid-cols-5">
              {["Home", "Stats", "..", "...", "Settings"].map((label) => (
                <button
                  key={label}
                  className="inline-flex flex-col items-center justify-center text-[11px] text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {label === "Home" && (
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-[#33003b]"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
                      />
                    </svg>
                  )}
                  {label === "Stats" && (
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-[#33003b]"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667"
                      />
                    </svg>
                  )}
                  {label !== "Home" && label !== "Stats" && (
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-[#33003b]"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z" />
                    </svg>
                  )}

                  <span className="mt-1">{label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Modals */}
    </main>
  );
}
