import { useEffect, useState } from 'react';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import Event from '../components/event/Event';
import styles from './MyProfile.module.css';
import { getUserProfile }  from '../utils/api/apiTaskManager';

const MyProfile = () => {
    const [inscricoes, setInscricoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Estado para dados do perfil - inicializado vazio, será preenchido pela API
    const [userData, setUserData] = useState({
        nome: '',
        cpf: '',
        dataNascimento: '',
        email: '',
        senha: '',
        logradouro: '',
        numero: '',
        bairro: '',
        telefone: ''
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);

    const itemsPerPage = 3;

    // Scroll para o topo quando a página carrega
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar apenas dados do perfil que já inclui eventos organizados
                const profileResponse = await getUserProfile();
                
                // Como o backend retorna uma lista com um item, pegamos o primeiro elemento
                const profileData = Array.isArray(profileResponse) ? profileResponse[0] : profileResponse;
                
                // Atualizar dados do perfil
                setUserData({
                    nome: profileData.nome || '',
                    cpf: profileData.cpf || '',
                    dataNascimento: profileData.data_nascimento ? 
                        new Date(profileData.data_nascimento).toLocaleDateString('pt-BR') : '',
                    email: profileData.email || '',
                    senha: '••••••••••••••••••••', // Senha sempre mascarada
                    logradouro: profileData.rua || '', // Backend usa 'rua' ao invés de 'logradouro'
                    numero: profileData.numero || '',
                    bairro: profileData.bairro || '',
                    telefone: profileData.telefone || ''
                });
                
                // Atualizar dados dos eventos organizados
                setInscricoes(profileData.eventos_organizados || []);
                
                setLoading(false);
                setProfileLoading(false);
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
                setProfileError('Não foi possível carregar seus dados pessoais.');
                setError('Não foi possível carregar seus eventos. Tente novamente mais tarde.');
                setLoading(false);
                setProfileLoading(false);
            }
        };
        
        fetchData();
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
        <div className={styles.myProfilePage}>
            <Navigation />
            <main className={styles.mainContent}>
                
                <section className={styles.profileSection}>
                    {profileLoading ? (
                        <div className={styles.loadingMessage}>Carregando dados do perfil...</div>
                    ) : profileError ? (
                        <div className={styles.error}>{profileError}</div>
                    ) : (
                        <div className={styles.profileGrid}>
                        <div className={styles.profileCard}>
                            <h2 className={styles.cardTitle}>Dados Pessoais</h2>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Nome</label>
                                <input 
                                    type="text" 
                                    value={userData.nome}
                                    onChange={(e) => setUserData({...userData, nome: e.target.value})}
                                    className={styles.input}
                                />
                            </div>
                            
                            <div className={styles.formGridTwo}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>CPF</label>
                                    <input 
                                        type="text" 
                                        value={userData.cpf}
                                        onChange={(e) => setUserData({...userData, cpf: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Data de Nascimento</label>
                                    <input 
                                        type="text" 
                                        value={userData.dataNascimento}
                                        onChange={(e) => setUserData({...userData, dataNascimento: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                            
                            <h2 className={styles.cardTitle}>Endereço e contato</h2>
                            <div className={styles.formGridTwo}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Logradouro</label>
                                    <input 
                                        type="text" 
                                        value={userData.logradouro}
                                        onChange={(e) => setUserData({...userData, logradouro: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Número</label>
                                    <input 
                                        type="text" 
                                        value={userData.numero}
                                        onChange={(e) => setUserData({...userData, numero: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                            
                            <div className={styles.formGridTwo}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Bairro</label>
                                    <input 
                                        type="text" 
                                        value={userData.bairro}
                                        onChange={(e) => setUserData({...userData, bairro: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Telefone</label>
                                    <input 
                                        type="text" 
                                        value={userData.telefone}
                                        onChange={(e) => setUserData({...userData, telefone: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.rightColumn}>
                            <div className={styles.profileCard}>
                                <h2 className={styles.cardTitle}>Dados da Conta</h2>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input 
                                        type="email" 
                                        value={userData.email}
                                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Senha</label>
                                    <input 
                                        type="password" 
                                        value={userData.senha}
                                        onChange={(e) => setUserData({...userData, senha: e.target.value})}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                            
                            <div className={styles.profileCard}>
                                <h2 className={styles.cardTitle}>Configurações</h2>
                                <div className={styles.buttonGroup}>
                                    <button className={styles.editButton}>
                                        <span className={styles.buttonIcon}>✏️</span>
                                        Editar dados
                                    </button>
                                    <button className={styles.deleteButton}>
                                        <span className={styles.buttonIcon}>🗑️</span>
                                        Apagar conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}
                </section>

                <section className={styles.eventsSection}>
                    <h1 className={styles.pageTitle}>Meus eventos</h1>
                    
                    {/* barra de busca nao será implementada agora */}
                    {/* <div className={styles.searchContainer}>
                        <div className={styles.searchBar}>
                            <span className={styles.searchIcon}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="Buscar evento..."
                                className={styles.searchInput}
                            />
                        </div>
                    </div> */}

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
                                            {inscricoes.map(evento => (
                                                <div key={evento.id} className={styles.carouselItem}>
                                                    <Event 
                                                        id={evento.id}
                                                        title={evento.nome}
                                                        location={evento.localidade ? 
                                                            `${evento.localidade.cidade} - ${evento.localidade.uf}` : 
                                                            "Local não informado"
                                                        }
                                                        date={new Date(evento.dataIni).toLocaleDateString('pt-BR')}
                                                        status={evento.status === 'ativo' ? 'open' : 'closed'}
                                                        statusText={evento.status === 'ativo' ? 'Inscrições abertas' : 'Evento encerrado'}
                                                        image={evento.imagem}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

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
                                        Você ainda não organizou nenhum evento.
                                    </p>
                                </div>
                            )}

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
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default MyProfile;