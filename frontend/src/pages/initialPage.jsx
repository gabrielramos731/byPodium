import mainImage from "../assets/main-image.jpg";
import mainLogo from "../assets/logo-main.svg";
import Navigation from "../components/navigation/Navigation";
import SearchBar from "../components/searchBar/SearchBar";
import Footer from "../components/footer/Footer";
import EventList from "../components/event/EventList";
import { useEvents } from "../utils/hooks/useEvents";
import styles from "./initialPage.module.css";

function InitialPage() {
  const { events, loading, error } = useEvents();
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

      {loading && <div className={styles.loading}>Carregando eventos...</div>}
      {error && <div className={styles.error}>Erro: {error}</div>}

      {!loading && !error && (
        <>
          <EventList 
            events={events} 
            title="Todos os Eventos" 
            type="open" 
          />
          
          <EventList 
            events={events} 
            title="Eventos Encerrados" 
            type="closed" 
          />
        </>
      )}

      <Footer />
    </>
  );
}

export default InitialPage;
