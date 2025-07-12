import mainImage from "../assets/main-image.jpg";
import mainLogo from "../assets/logo-main.svg";
import Navigation from "../components/navigation/Navigation";
import SearchBar from "../components/searchBar/SearchBar";
import Footer from "../components/footer/Footer";
import styles from "./initialPage.module.css";

function InitialPage() {
  return (
    <>
      <section className={styles.heroBanner}>
        <img src={mainImage} alt="ByPodium Banner" className={styles.bannerImage} />
        <div className={styles.bannerOverlay}>
          <div className={styles.bannerContent}>
            <img src={mainLogo} alt="main-logo" />
          </div>
          <Navigation />
        </div>
      </section>

      <SearchBar />

      <section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Todos os Eventos</h2>
        <div className={styles.eventsGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={styles.eventCard}>
              <img src={mainImage} alt="Evento" className={styles.eventImage} />
              <div className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>Nome do evento</h3>
                <p className={styles.eventLocation}>Montes Claros - MG</p>
                <p className={styles.eventDate}>10/08/2025 - 06:30</p>
                <span className={`${styles.eventStatus} ${styles.statusOpen}`}>
                  Inscrições abertas
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Eventos Encerrados */}
      <section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Eventos Encerrados</h2>
        <div className={styles.eventsGrid}>
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.eventCard}>
              <img src={mainImage} alt="Evento" className={styles.eventImage} />
              <div className={styles.eventInfo}>
                <h3 className={styles.eventTitle}>Nome do evento</h3>
                <p className={styles.eventLocation}>Montes Claros - MG</p>
                <p className={styles.eventDate}>10/08/2025 - 06:30</p>
                <span className={`${styles.eventStatus} ${styles.statusClosed}`}>
                  Evento encerrado
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default InitialPage;
