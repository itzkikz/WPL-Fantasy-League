import { useNavigate } from "@tanstack/react-router";
import React from "react";

const ManagerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md rounded-3xl p-3 shadow-xl overflow-hidden">
      {/* Header Card with Gradient */}
      <div className="bg-gradient-to-br from-cyan-400 rounded-3xl via-blue-500 to-purple-600 p-6 text-white relative">
        {/* User Info */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">vadakens</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">kiran nandakumar</span>
              <img
                src="https://flagcdn.com/w20/in.png"
                alt="India flag"
                className="w-5 h-3"
              />
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <p className="text-sm text-center mb-3 opacity-90">Gameweek 9</p>
          <div className="flex items-end justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold">46</p>
              <p className="text-xs mt-1 opacity-80">Average</p>
            </div>
            <div className="text-center">
              <p className="text-6xl font-bold">35</p>
              <p className="text-sm mt-1 flex items-center justify-center gap-1">
                Points
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">124</p>
              <p className="text-xs mt-1 flex items-center justify-center gap-1 opacity-80">
                Highest
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate({
                to: "/manager/pick-team",
              })
            }
            className="flex-1 bg-blue-900/40 hover:bg-blue-900/50 backdrop-blur-sm rounded-full py-3 px-4 flex items-center justify-center gap-2 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="font-semibold">Pick Team</span>
          </button>
          <button className="flex-1 bg-purple-900/40 hover:bg-purple-900/50 backdrop-blur-sm rounded-full py-3 px-4 flex items-center justify-center gap-2 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Transfers</span>
          </button>
        </div>
      </div>

      {/* Points & Rankings Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Points & Rankings</h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Gameweek History
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="">Overall points</span>
            <span className="font-semibold">35</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="">Overall rank</span>
            <span className="font-semibold">12,195,771</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="">Total players</span>
            <span className="font-semibold">12,322,756</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="">Gameweek points</span>
            <span className="font-semibold">35</span>
          </div>
        </div>
      </div>

      {/* My Team Badge Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Team Badge</h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Generate Team Badge
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center">
          <div className="w-24 h-24 mb-4 flex items-center justify-center">
            <svg
              className="w-full h-full text-purple-900"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M50 10 L20 25 L20 55 Q20 75 50 90 Q80 75 80 55 L80 25 Z"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <line
                x1="35"
                y1="45"
                x2="65"
                y2="45"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="50"
                y1="30"
                x2="50"
                y2="60"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-center font-semibold mb-1">
            Generate
          </p>
          <p className="text-center ">team badge</p>
          <div className="mt-4 flex items-center gap-2">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23FF0000'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'/%3E%3C/svg%3E"
              alt="Adobe Express"
              className="w-5 h-5"
            />
            <span className="text-xs text-gray-600">Powered by</span>
            <span className="text-xs font-semibold">
              Adobe Express
            </span>
          </div>
        </div>
      </div>

      {/* Transfers Section */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Transfers</h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            Transfer History
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;
