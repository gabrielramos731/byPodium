import logoFooter from "../../assets/logo-footer.svg";
import twitterLogo from "../../assets/twitter-Icon.svg";
import instagramLogo from "../../assets/instagram-Icon.svg";
import youtubeLogo from "../../assets/youtube-Icon.svg";
import linkedinLogo from "../../assets/linkedin-Icon.svg";
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <img src={logoFooter} alt="logo-footer"/>
        </div>
        <p className={styles.footerText}>
          Projeto de trabalho de conclusão de módulo de Análise e
          Desenvolvimento de Sistemas. O objetivo é aplicar os conceitos
          aprendidos.
        </p>
        <div className={styles.socialLinks}>
          <a href="#" className={styles.socialLink}>
            <img src={twitterLogo} alt="" />
          </a>
          <a href="#" className={styles.socialLink}>
            <img src={instagramLogo} alt="" />
          </a>
          <a href="#" className={styles.socialLink}>
            <img src={youtubeLogo} alt="" />
          </a>
          <a href="#" className={styles.socialLink}>
            <img src={linkedinLogo} alt="" />
          </a>
        </div>
        <p className={styles.footerCredits}>ByPodium ©2025</p>
      </div>
    </footer>
  );
}

export default Footer;
