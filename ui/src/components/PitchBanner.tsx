import { FunctionComponent } from "react";
import Logo from "../assets/wplff.svg";


interface PitchBannerProps {
    
}
 
const PitchBanner: FunctionComponent<PitchBannerProps> = () => {
    return ( <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 flex items-center justify-center">
                <img
                  src={Logo}
                  alt="PLogo"
                  className="w-5 h-5 animate-bounce"
                />
              </div>

              {/* Fantasy Text */}
              <span className="text-xs font-bold">WPL Fantasy</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img
                    src={Logo}
                    alt="PLogo"
                    className="w-5 h-5 animate-bounce"
                  />
                </div>

                {/* Fantasy Text */}
                <span className="text-white text-xs font-bold">
                  WPL Fantasy
                </span>
              </div>
            </div>
          </div>
        </div>);
}
 
export default PitchBanner;