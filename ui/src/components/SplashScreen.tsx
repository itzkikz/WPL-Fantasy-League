import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import DarkLogo from "../assets/wplf1-dark.png";
import LightLogo from "../assets/wplf1-light.png";
import "./styles/splash.css";

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
        <div className="splash-screen-container">
          {/* Main splash content */}
          <div className="splash-content">
            {/* Logo Container with glow effect */}
            <div className="logo-container">
              <div className="logo-wrapper">
                <img
                  src={DarkLogo}
                  alt="WPL Logo"
                  className="hidden dark:block logo-image"
                />
                <img
                  src={LightLogo}
                  alt="WPL Logo"
                  className="block dark:hidden logo-image"
                />
              </div>
            </div>

            {/* Title Section */}
            <div className="title-section">
              <h1 className="text-2xl font-bold tracking-tight animate-pulse">
                WPL
              </h1>
              <h2 className="text-xl font-bold tracking-tight animate-pulse">
                Fantasy Football
              </h2>
            </div>
          </div>

          {/* Footer Attribution Text */}
          <div className="splash-footer">
            <p className="splash-attribution">Ramshad & Team</p>
          </div>

          {/* Fade out overlay */}
          <div className="splash-overlay"></div>
        </div>
      )}
    </>
  );
};

export default SplashScreen;
