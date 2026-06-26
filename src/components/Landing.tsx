import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";
import BlurText from "./BlurText";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>
              <BlurText text="Hello! I'm" animateBy="letters" delay={30} as="span" />
            </h2>
            <h1>
              <BlurText text={firstName.toUpperCase()} animateBy="letters" delay={40} as="span" />
              {' '}
              <br />
              {lastName && (
                <BlurText text={lastName.toUpperCase()} animateBy="letters" delay={40} as="span" />
              )}
            </h1>
          </div>
          <div className="landing-info">
            <h3>
              <BlurText text="An" animateBy="letters" delay={40} as="span" />
            </h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">
                <BlurText text="AI Engineer" animateBy="letters" delay={30} as="span" />
              </div>
            </h2>
            <h2>
              <div className="landing-h2-info">
                <BlurText text="Full-Stack Developer" animateBy="letters" delay={30} as="span" />
              </div>
            </h2>
          </div>
          {/* Mobile photo - shows only on mobile when 3D character is hidden */}
          <div className="mobile-photo">
            <img src="/images/avatar.jpg" alt={config.developer.fullName} />
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
