import { useEffect, useState } from 'react';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import Event from '../components/event/Event';
import styles from './MyProfile.module.css';
import { getUserInscriptions }  from '../utils/api/apiTaskManager';

const MyProfile = () => {
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const itemsPerPage = 3;

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

    const nextSlide = () => {
        if (currentIndex < inscricoes.length - itemsPerPage) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const maxIndex = Math.max(0, inscricoes.length - itemsPerPage);

    return (
        <div className={styles.myEventsPage}>
            <Navigation />
            <main className={styles.mainContent}>
                <h1 className={styles.pageTitle}>Meus Eventos</h1>
                {loading && <div className={styles.loadingMessage}>Carregando...</div>}
                {error && <p className={styles.error}>{error}</p>}
                {!loading && !error && (
                    <>
                        {inscricoes.length > 0 ? (
                            <div className={styles.carouselContainer}>
                                <button 
                                    className={`${styles.carouselBtn} ${styles.prevBtn}`}
                                    onClick={prevSlide}
                                    disabled={currentIndex === 0}
                                >
                                    &#8249;
                                </button>

                                <div className={styles.carouselWrapper}>
                                    <div 
                                        className={styles.carouselTrack}
                                        style={{
                                            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`
                                        }}
                                    >
                                        {inscricoes.map(inscricao => (
                                            <div key={inscricao.id} className={styles.carouselItem}>
                                                <Event 
                                                    id={inscricao.evento.id}
                                                    title={inscricao.evento.nome}
                                                    location={inscricao.evento.localidade ? 
                                                        `${inscricao.evento.localidade.cidade} - ${inscricao.evento.localidade.uf}` : 
                                                        "Local não informado"
                                                    }
                                                    date={new Date(inscricao.evento.dataIni).toLocaleDateString('pt-BR')}
                                                    status={inscricao.evento.status === 'ativo' ? 'open' : 'closed'}
                                                    statusText={inscricao.evento.status === 'ativo' ? 'Inscrições abertas' : 'Evento encerrado'}
                                                    image={inscricao.evento.imagem}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Botão Próximo */}
                                <button 
                                    className={`${styles.carouselBtn} ${styles.nextBtn}`}
                                    onClick={nextSlide}
                                    disabled={currentIndex >= maxIndex}
                                >
                                    &#8250;
                                </button>
                            </div>
                        ) : (
                            <div className={styles.noEventsContainer}>
                                <p className={styles.noEventsMessage}>
                                    Você ainda não se inscreveu em nenhum evento.
                                </p>
                            </div>
                        )}

                        {/* Indicadores de página (dots) */}
                        {inscricoes.length > itemsPerPage && (
                            <div className={styles.carouselIndicators}>
                                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.indicator} ${
                                            currentIndex === index ? styles.indicatorActive : ''
                                        }`}
                                        onClick={() => goToSlide(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyProfile;