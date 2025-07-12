import mainImage from "../assets/main-image.jpg";
import mainLogo from "../assets/logo-main.svg";
import Navigation from "../components/navigation/Navigation";
import SearchBar from "../components/searchBar/SearchBar";
import Footer from "../components/footer/Footer";
import Event from "../components/event/Event";
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
            <Event
              key={item}
              title="Nome do evento"
              location="Montes Claros - MG"
              date="10/08/2025 - 06:30"
              status="open"
              statusText="Inscrições abertas"
              image={mainImage}
              onClick={() => console.log(`Evento ${item} clicado`)}
            />
          ))}
        </div>
      </section>

      {/* Eventos Encerrados */}
      <section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Eventos Encerrados</h2>
        <div className={styles.eventsGrid}>
          {[1, 2, 3].map((item) => (
            <Event
              key={item}
              title="Nome do evento"
              location="Montes Claros - MG"
              date="10/08/2025 - 06:30"
              status="closed"
              statusText="Evento encerrado"
              image={mainImage}
              onClick={() => console.log(`Evento encerrado ${item} clicado`)}
            />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default InitialPage;
