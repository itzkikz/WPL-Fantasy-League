import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Logo from "../assets/wplff.svg";
import { useLogin } from "../features/auth/hooks";
import Button from "../components/common/Button";

const LoginPage = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const mutation = useLogin((data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    navigate({ to: "/manager" });
  });

  // Preselected user options
  const userOptions = [
    "InConsistent",
    "Air10 Srikers",
    "Magical Magyars",
    "Gunda Koyi",
    "Seal Breakers",
    "Relegated FC",
    "COF 26",
    "Airjith Strikers",
    "Peeranki FC",
    "Vava FC",
    "Athiradi FC",
    "4 Guys 1 Cup",
    "Blaublancos",
    "Mamangam DC",
    "Kona Kona FC",
  ];

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return userOptions;
    return userOptions.filter((user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, userOptions]);

  // Check if form is complete
  const isFormComplete = selectedUser && password.trim();

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    mutation.mutate({
      teamName: form.teamName.value,
      password: form.password.value,
    });
  };

  return (
    <div className="min-h-screen bg-white-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-sm flex items-center justify-center">
            <img
              src={Logo}
              alt="PLogo"
              className="w-20 h-20 animate-bounce opacity-90"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-8">Log In</h1>
        {mutation.isError && (
          <h1 className="text-base font-semibold text-center text-red-700 mb-8">
            {mutation?.error?.data?.error}
          </h1>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/teamName Input */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-6 py-4 bg-white border-2 border-slate-600 rounded-full text-left text-[#2a1134] placeholder-gray-400 focus:outline-none focus:border-[#2a1134] transition-colors flex items-center justify-between"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <span
                className={selectedUser ? "text-[#2a1134]" : "text-gray-400"}
              >
                {selectedUser || "Select Team"}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Hidden input keeping track of final selected value */}
            <input
              type="text"
              name="teamName"
              value={selectedUser || ""}
              readOnly
              className="hidden"
            />

            {/* Dropdown Menu with Search */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-400 rounded-2xl shadow-lg max-h-60 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-slate-300">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search teams..."
                    className="w-full px-4 py-2 text-[#2a1134] placeholder-gray-400 border border-slate-300 rounded-lg focus:outline-none  transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>

                {/* Filtered Results */}
                <div className="overflow-y-auto max-h-48">
                  <ul className="py-2" role="listbox">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectUser(user)}
                          className="px-6 py-3 text-[#2a1134] hover:bg-slate-600 cursor-pointer transition-colors"
                          role="option"
                          aria-selected={selectedUser === user}
                        >
                          {user}
                        </li>
                      ))
                    ) : (
                      <li className="px-6 py-3 text-gray-400 text-center">
                        No teams found
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white border-2 border-slate-600 rounded-full text-[#2a1134] placeholder-gray-400 focus:outline-none focus:border-[#2a1134] transition-colors"
              placeholder="Password"
              name="password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#2a1134]"
            >
              {showPassword ? (
                // Eye open icon
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                // Eye closed icon
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
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={!isFormComplete}
            className={`w-full py-4 text-xl font-semibold rounded-full transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-purple-500/50 mt-6 ${
              isFormComplete
                ? "bg-[#1e0021] dark:bg-white text-white dark:text-[#1e0021] hover:scale-[1.02] cursor-pointer"
                : "bg-[#ebe5eb] dark:bg-[#541e5d] cursor-not-allowed opacity-60"
            }`}
          >
            Log In
          </button>
          {/* Divider */}
          <div className="flex items-center justify-center py-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>
          <Button
            width="w-full"
            type="Secondary"
            children={<div className="text-lg font-semibold">Skip</div>}
            onClick={() => navigate({ to: "/standings" })}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
