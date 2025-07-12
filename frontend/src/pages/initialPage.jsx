import mainImage from "../assets/main-image.jpg";
import mainLogo from "../assets/logo-main.svg";
import Navigation from "../components/Navigation";
import SearchBar from "../components/SearchBar";
import "./initialPage.css";

function InitialPage() {
  return (
    <>
      <section className="hero-banner">
        <img src={mainImage} alt="ByPodium Banner" className="banner-image" />
        <div className="banner-overlay">
          <div className="banner-content">
            <img src={mainLogo} alt="main-logo" />
          </div>
          <Navigation />
        </div>
      </section>

      <SearchBar />

      {/* Todos os Eventos */}
      <section className="events-section">
        <h2 className="section-title">Todos os Eventos</h2>
        <div className="events-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="event-card">
              <img src={mainImage} alt="Evento" className="event-image" />
              <div className="event-info">
                <h3 className="event-title">Nome do evento</h3>
                <p className="event-location">Montes Claros - MG</p>
                <p className="event-date">10/08/2025 - 06:30</p>
                <span className="event-status status-open">
                  Inscrições abertas
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eventos Encerrados */}
      <section className="events-section">
        <h2 className="section-title">Eventos Encerrados</h2>
        <div className="events-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="event-card">
              <img src={mainImage} alt="Evento" className="event-image" />
              <div className="event-info">
                <h3 className="event-title">Nome do evento</h3>
                <p className="event-location">Montes Claros - MG</p>
                <p className="event-date">10/08/2025 - 06:30</p>
                <span className="event-status status-closed">
                  Evento encerrado
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">🏆</span>
            <span className="logo-text">ByPodium</span>
          </div>
          <p className="footer-text">
            Projeto de trabalho de conclusão de módulo de Análise e
            Desenvolvimento de Sistemas. O objetivo é aplicar os conceitos
            aprendidos.
          </p>
          <div className="social-links">
            <a href="#" className="social-link">
              𝕏
            </a>
            <a href="#" className="social-link">
              📷
            </a>
            <a href="#" className="social-link">
              📺
            </a>
            <a href="#" className="social-link">
              💼
            </a>
          </div>
          <p className="footer-credits">ByPodium ©2024</p>
        </div>
      </footer>
    </>
  );
}

export default InitialPage;
