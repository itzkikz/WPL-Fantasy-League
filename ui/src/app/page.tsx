"use client";
import { useState, useEffect } from "react";
import DataTable from "../components/Datatable";
import {
  fetchRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  searchRecords,
} from "@/lib/api";
import LeagueTable from "../components/LeagueTable";
import GameweekTeamView from "../components/GameweekTeamView";

export default function Home() {
  const [data, setData] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchRecords();
      if (result.data && result.data.length > 0) {
        setData(result.data);
        setFields(Object.keys(result.data[0]));
        setSearchField(Object.keys(result.data[0])[0]);
      }
    } catch (error) {
      alert("Error loading data: " + error.message);
    }
    setLoading(false);
  };

  const handleAdd = async (newRecord) => {
    await addRecord(newRecord);
    await loadData();
  };

  const handleUpdate = async (updatedRecord) => {
    const id = updatedRecord[fields[0]];
    await updateRecord(id, updatedRecord);
    await loadData();
  };

  const handleDelete = async () => {
    const id = selectedRecord[fields[0]];
    await deleteRecord(id);
    await loadData();
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      loadData();
      return;
    }
    try {
      const result = await searchRecords(searchField, searchTerm);
      setData(result.data);
    } catch (error) {
      alert("Error searching: " + error.message);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    loadData();
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
      <div className="max-w-7xl mx-auto">
            <div className="flex h-screen flex-col mx-auto max-w-md bg-white shadow-sm">
        {/* Data Table */}
        {loading ? (
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
      <div className="text-center">
        {/* Spinning Football/Soccer Ball */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg 
            className="w-24 h-24 animate-spin text-white" 
            viewBox="0 0 100 100" 
            fill="none"
          >
            <circle 
              className="opacity-25" 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="currentColor" 
              strokeWidth="8"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M50 5 A45 45 0 0 1 95 50"
            />
          </svg>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Loading Your Team
        </h2>
        <p className="text-green-100">
          Preparing your fantasy lineup...
        </p>
      </div>
    </div>
        ) : (
          <LeagueTable data={data} />
          // <GameweekTeamView />
        )}
        {/* Fixed bottom navigation */}
        <nav className="flex-none border-t border-gray-200 bg-white">
          <div className="grid h-16 grid-cols-5">
            {["Home", "Stats", "..", "...", "...."].map((label) => (
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
