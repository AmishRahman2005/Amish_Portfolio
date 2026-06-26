import { config } from "../config";
import "./styles/CallToAction.css";

const CallToAction = () => {
  return (
    <div className="cta-section">
      <div className="cta-buttons">
        <a 
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.contact.email}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="cta-btn cta-btn-hire"
          data-cursor="disable"
        >
          Reach Out to Me →
        </a>
      </div>
    </div>
  );
};

export default CallToAction;
