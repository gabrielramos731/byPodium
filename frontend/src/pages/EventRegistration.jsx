import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import { getUserProfile, getEventRegistrationInfo, createEventRegistration, getEventById } from '../utils/api/apiTaskManager';
import { formatDateToBR } from '../utils/dateUtils';
import styles from './EventRegistration.module.css';

function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedKit, setSelectedKit] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileResponse, eventResponse, eventDataResponse] = await Promise.all([
          getUserProfile(),
          getEventRegistrationInfo(id),
          getEventById(id)
        ]);
        
        const profileData = Array.isArray(profileResponse) ? profileResponse[0] : profileResponse;
        setUserProfile(profileData);
        setEventInfo(eventResponse);
        setEventData(eventDataResponse);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        navigate(`/evento/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedCategory && (selectedKit || !eventInfo?.kits?.length)) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/evento/${id}`);
    }
  };

  const calculateTotal = () => {
    let total = parseFloat(eventData?.valorInsc || 0);
    if (selectedKit && selectedKit.precoExtra) {
      total += parseFloat(selectedKit.precoExtra);
    }
    return total.toFixed(2);
  };

  const handleConfirmRegistration = async () => {
    try {
      setSubmitting(true);
      
      const registrationData = {
        categoria: selectedCategory?.id,
        ...(selectedKit && { kit: selectedKit.id })
      };

      const response = await createEventRegistration(id, registrationData);
      
      
      if (response.payment_url && response.needs_payment) {
        window.location.href = `http://127.0.0.1:8000${response.payment_url}`;
      } else {
        navigate(`/evento/${id}`);
      }
      
    } catch (error) {
      console.error('Erro ao realizar inscrição:', error);
      alert('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.registrationContainer}>
        <Navigation />
        <main className={styles.mainContent}>
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Carregando...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.registrationContainer}>
      <Navigation />
      
      <main className={styles.mainContent}>
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h1 className={styles.modalTitle}>{eventData?.nome || 'Nome do evento'}</h1>
            
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''}`}>
                <div className={styles.stepIcon}>👤</div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''}`}>
                <div className={styles.stepIcon}>🎁</div>
              </div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${currentStep >= 3 ? styles.stepActive : ''}`}>
                <div className={styles.stepIcon}>💳</div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className={styles.stepContent}>
                <div className={styles.userInfoGrid}>
                  <div className={styles.infoGroup}>
                    <label>Nome</label>
                    <div className={styles.infoValue}>{userProfile?.nome || '-'}</div>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>CPF</label>
                    <div className={styles.infoValue}>{userProfile?.cpf || '-'}</div>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Data de Nascimento</label>
                    <div className={styles.infoValue}>
                      {userProfile?.data_nascimento ? formatDateToBR(userProfile.data_nascimento) : '-'}
                    </div>
                  </div>
                  <div className={styles.infoGroup}>
                    <label>Email</label>
                    <div className={styles.infoValue}>{userProfile?.email || '-'}</div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className={styles.stepContent}>
                <div className={styles.kitSelection}>
                  <div className={styles.kitGroup}>
                    <label>Categoria</label>
                    <select 
                      className={styles.kitSelect}
                      value={selectedCategory?.id || ''}
                      onChange={(e) => {
                        const categoryId = parseInt(e.target.value);
                        const category = eventInfo?.categorias?.find(c => c.id === categoryId);
                        setSelectedCategory(category);
                        setSelectedKit(null);
                      }}
                    >
                      <option value="">Escolha sua categoria</option>
                      {eventInfo?.categorias?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {eventInfo?.kits?.length > 0 && (
                    <div className={styles.kitGroup}>
                      <label>Kit</label>
                      <select 
                        className={styles.kitSelect}
                        value={selectedKit?.id || ''}
                        onChange={(e) => {
                          const kitId = parseInt(e.target.value);
                          const kit = eventInfo?.kits?.find(k => k.id === kitId);
                          setSelectedKit(kit);
                        }}
                        disabled={!selectedCategory}
                      >
                        <option value="">Escolha seu kit</option>
                        {eventInfo?.kits?.map((kit) => (
                          <option key={kit.id} value={kit.id}>
                            {kit.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.stepContent}>
                <div className={styles.paymentSimulation}>
                  <h3>Confirmação da Inscrição</h3>
                  <div className={styles.summaryContainer}>
                    <div className={styles.summaryItem}>
                      <strong>Evento:</strong> {eventData?.nome}
                    </div>
                    <div className={styles.summaryItem}>
                      <strong>Categoria:</strong> {selectedCategory?.nome}
                    </div>
                    <div className={styles.summaryItem}>
                      <strong>Valor da Inscrição:</strong> R$ {parseFloat(eventData?.valorInsc || 0).toFixed(2)}
                    </div>
                    {selectedKit ? (
                      <>
                        <div className={styles.summaryItem}>
                          <strong>Kit Escolhido:</strong> {selectedKit.nome}
                        </div>
                        <div className={styles.summaryItem}>
                          <strong>Valor do Kit:</strong> R$ {parseFloat(selectedKit.precoExtra || 0).toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <div className={styles.summaryItem}>
                        <strong>Kit:</strong> Nenhum kit selecionado (R$ 0,00)
                      </div>
                    )}
                    <div className={styles.summaryTotal}>
                      <strong>Valor Total:</strong> 
                      <strong>R$ {calculateTotal()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.modalButtons}>
              <button 
                className={styles.backButton}
                onClick={handleBack}
                disabled={submitting}
              >
                Voltar
              </button>
              
              {currentStep < 3 ? (
                <button 
                  className={styles.nextButton}
                  onClick={handleNext}
                  disabled={currentStep === 2 && (!selectedCategory || (eventInfo?.kits?.length > 0 && !selectedKit))}
                >
                  Avançar
                </button>
              ) : (
                <button 
                  className={styles.confirmButton}
                  onClick={handleConfirmRegistration}
                  disabled={submitting}
                >
                  {submitting ? 'Processando...' : 'Prosseguir para Pagamento'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default EventRegistration;
