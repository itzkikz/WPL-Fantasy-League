import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import Logo from "../assets/wplff.svg";

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      navigate({ to: "/standings" });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-sm flex items-center justify-center">
              <img
                src={Logo}
                alt="PLogo"
                className="w-12 h-12 animate-bounce opacity-90"
              />
            </div>
            <div className="flex-row h-14">
              <h1 className="text-white text-2xl font-bold tracking-tight animate-pulse">
                WPL
              </h1>
              <h2 className="text-white text-lg font-bold tracking-tight animate-pulse">
                Fantasy Football
              </h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SplashScreen;
