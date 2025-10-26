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
          <div className="text-center">
            <div className="flex items-center gap-1">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center">
                <img src={Logo} alt="PLogo" className="w-8 h-8" />
              </div>
              {/* Fantasy Text */}
              <h1 className="text-white text-2xl font-bold tracking-tight">
                WPL 
              </h1>
            </div>
             <h2 className="text-white text-lg font-bold tracking-tight">Fantasy Football</h2>
          </div>
        </div>
      )}
    </>
  );
};

export default SplashScreen;
