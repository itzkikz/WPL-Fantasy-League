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
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 rounded-sm flex items-center justify-center mr-2">
              <img
                src={Logo}
                alt="PLogo"
                className="w-24 h-24 animate-bounce opacity-90"
              />
            </div>
            <div className="flex-row h-24">
              <h1 className="text-4xl font-bold tracking-tight animate-pulse">
                WPL
              </h1>
              <h2 className="text-2xl font-bold tracking-tight animate-pulse">
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
