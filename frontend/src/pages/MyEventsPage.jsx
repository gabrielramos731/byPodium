import { useEffect, useState } from 'react';
import api from '../utils/api/apiTaskManager';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import Event from '../components/event/Event';
import styles from './MyEventsPage.module.css';
import eventListStyles from '../components/event/EventList.module.css'; 
import { getUserInscriptions }  from '../utils/api/apiTaskManager';

const MyEventsPage = () => {
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const data = await getUserInscriptions();
                setInscricoes(data);
                setLoading(false);
            } catch (err) {
                setError('Não foi possível carregar seus eventos. Tente novamente mais tarde.');
                setLoading(false);
                console.error(err);
            }
        };
        fetchMyEvents();
    }, []);

    return (
        <div className={styles.myEventsPage}>
            <Navigation />
            <main className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Meus Eventos</h1>
                {loading && <p>Carregando...</p>}
                {error && <p className={styles.error}>{error}</p>}
                {!loading && !error && (
                    <div className={eventListStyles.eventList}>
                        {inscricoes.length > 0 ? (
                            inscricoes.map(inscricao => (
                                <Event key={inscricao.id} event={inscricao.evento} />
                            ))
                        ) : (
                            <p>Você ainda não se inscreveu em nenhum evento.</p>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyEventsPage;