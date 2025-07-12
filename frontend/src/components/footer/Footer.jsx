import logoFooter from "../../assets/logo-footer.svg";
import twitterLogo from "../../assets/twitter-icon.svg";
import instagramLogo from "../../assets/instagram-icon.svg";
import youtubeLogo from "../../assets/youtube-icon.svg";
import linkedinLogo from "../../assets/linkedin-icon.svg";
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <span className="logo-icon"><img src={logoFooter} alt="logo-footer"/></span>
        </div>
        <p className="footer-text">
          Projeto de trabalho de conclusão de módulo de Análise e
          Desenvolvimento de Sistemas. O objetivo é aplicar os conceitos
          aprendidos.
        </p>
        <div className="social-links">
          <a href="#" className="social-link">
            <img src={twitterLogo} alt="" />
          </a>
          <a href="#" className="social-link">
            <img src={instagramLogo} alt="" />
          </a>
          <a href="#" className="social-link">
            <img src={youtubeLogo} alt="" />
          </a>
          <a href="#" className="social-link">
            <img src={linkedinLogo} alt="" />
          </a>
        </div>
        <p className="footer-credits">ByPodium ©2025</p>
      </div>
    </footer>
  );
}

export default Footer;
