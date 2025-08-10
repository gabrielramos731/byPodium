import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import { getEventToManage, updateEvent } from '../utils/api/apiTaskManager';
import styles from './EditEvent.module.css';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    data_inicio_inscricao: '',
    data_fim_inscricao: '',
    horario_inicio: '',
    valor_inscricao: '',
    limite_participantes: '',
    imagem: null
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const loadEventData = async () => {
      try {
        setLoading(true);
        const eventData = await getEventToManage(id);
        
        const formattedData = {
          nome: eventData.nome || '',
          descricao: eventData.descricao || '',
          data_inicio: eventData.dataIni || '',
          data_fim: eventData.dataFim || '',
          data_inicio_inscricao: eventData.dataIniInsc || '',
          data_fim_inscricao: eventData.dataFimInsc || '',
          horario_inicio: eventData.horarioIni || '',
          valor_inscricao: eventData.valorInsc || '',
          limite_participantes: eventData.limiteQuantInsc || '',
          imagem: null
        };
        
        setFormData(formattedData);
        setOriginalData(formattedData);
        
      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do evento é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória';
    }

    if (!formData.data_fim) {
      newErrors.data_fim = 'Data de fim é obrigatória';
    }

    if (formData.data_inicio && formData.data_fim && formData.data_inicio > formData.data_fim) {
      newErrors.data_fim = 'Data de fim deve ser posterior à data de início';
    }

    if (!formData.data_inicio_inscricao) {
      newErrors.data_inicio_inscricao = 'Data de início das inscrições é obrigatória';
    }

    if (!formData.data_fim_inscricao) {
      newErrors.data_fim_inscricao = 'Data de fim das inscrições é obrigatória';
    }

    if (formData.data_inicio_inscricao && formData.data_fim_inscricao && formData.data_inicio_inscricao > formData.data_fim_inscricao) {
      newErrors.data_fim_inscricao = 'Data de fim das inscrições deve ser posterior à data de início das inscrições';
    }

    if (formData.data_fim_inscricao && formData.data_inicio && formData.data_fim_inscricao > formData.data_inicio) {
      newErrors.data_fim_inscricao = 'Data de fim das inscrições deve ser anterior ou igual à data do evento';
    }

    if (!formData.horario_inicio) {
      newErrors.horario_inicio = 'Horário de início é obrigatório';
    }

    if (!formData.valor_inscricao) {
      newErrors.valor_inscricao = 'Valor da inscrição é obrigatório';
    } else if (parseFloat(formData.valor_inscricao) < 0) {
      newErrors.valor_inscricao = 'Valor deve ser maior ou igual a zero';
    }

    if (!formData.limite_participantes) {
      newErrors.limite_participantes = 'Limite de participantes é obrigatório';
    } else if (parseInt(formData.limite_participantes) <= 0) {
      newErrors.limite_participantes = 'Limite deve ser maior que zero';
    }

    return newErrors;
  };

  const getChangedFields = () => {
    const changedFields = {};
    
    Object.keys(formData).forEach(key => {
      if (key === 'imagem') {
        if (formData[key]) {
          changedFields[key] = formData[key];
        }
      } else if (formData[key] !== originalData[key]) {
        changedFields[key] = formData[key];
      }
    });

    return changedFields;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const changedFields = getChangedFields();
    
    if (Object.keys(changedFields).length === 0) {
      return;
    }

    setSubmitting(true);
    
    try {
      const eventData = new FormData();
      
      Object.keys(changedFields).forEach(key => {
        if (changedFields[key] !== '' && changedFields[key] !== null) {
          let backendKey = key;
          if (key === 'data_inicio') backendKey = 'dataIni';
          else if (key === 'data_fim') backendKey = 'dataFim';
          else if (key === 'data_inicio_inscricao') backendKey = 'dataIniInsc';
          else if (key === 'data_fim_inscricao') backendKey = 'dataFimInsc';
          else if (key === 'horario_inicio') backendKey = 'horarioIni';
          else if (key === 'valor_inscricao') backendKey = 'valorInsc';
          else if (key === 'limite_participantes') backendKey = 'limiteQuantInsc';
          
          eventData.append(backendKey, changedFields[key]);
        }
      });

      await updateEvent(id, eventData);
      
      navigate(`/evento/${id}`);
      
    } catch (error) {
      if (error.response?.data) {
        const serverErrors = {};
        Object.keys(error.response.data).forEach(key => {
          serverErrors[key] = Array.isArray(error.response.data[key]) 
            ? error.response.data[key][0] 
            : error.response.data[key];
        });
        setErrors(serverErrors);
      } else {
        console.error('Erro ao atualizar evento:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Carregando dados do evento...</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Editar Evento</h1>
          
          <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Informações Básicas</h2>
              
              <div className={styles.inputGroup}>
                <label htmlFor="nome" className={styles.label}>Nome do Evento *</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.nome ? styles.inputError : ''}`}
                  placeholder="Digite o nome do evento"
                />
                {errors.nome && <span className={styles.errorMessage}>{errors.nome}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="descricao" className={styles.label}>Descrição *</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.descricao ? styles.inputError : ''}`}
                  placeholder="Descreva o evento"
                  rows="4"
                />
                {errors.descricao && <span className={styles.errorMessage}>{errors.descricao}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="imagem" className={styles.label}>Nova Imagem do Evento</label>
                <input
                  id="imagem"
                  name="imagem"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className={styles.input}
                />
                <small className={styles.helpText}>Deixe em branco para manter a imagem atual</small>
                {errors.imagem && <span className={styles.errorMessage}>{errors.imagem}</span>}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Data e Horário</h2>
              
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="data_inicio" className={styles.label}>Data de Início do Evento*</label>
                  <input
                    id="data_inicio"
                    name="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.data_inicio ? styles.inputError : ''}`}
                  />
                  {errors.data_inicio && <span className={styles.errorMessage}>{errors.data_inicio}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="data_fim" className={styles.label}>Data de Fim do Evento*</label>
                  <input
                    id="data_fim"
                    name="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.data_fim ? styles.inputError : ''}`}
                  />
                  {errors.data_fim && <span className={styles.errorMessage}>{errors.data_fim}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="horario_inicio" className={styles.label}>Horário de Início do Evento*</label>
                  <input
                    id="horario_inicio"
                    name="horario_inicio"
                    type="time"
                    value={formData.horario_inicio}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.horario_inicio ? styles.inputError : ''}`}
                  />
                  {errors.horario_inicio && <span className={styles.errorMessage}>{errors.horario_inicio}</span>}
                </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="data_inicio_inscricao" className={styles.label}>Início das Inscrições *</label>
                  <input
                    id="data_inicio_inscricao"
                    name="data_inicio_inscricao"
                    type="date"
                    value={formData.data_inicio_inscricao}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.data_inicio_inscricao ? styles.inputError : ''}`}
                  />
                  {errors.data_inicio_inscricao && <span className={styles.errorMessage}>{errors.data_inicio_inscricao}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="data_fim_inscricao" className={styles.label}>Fim das Inscrições *</label>
                  <input
                    id="data_fim_inscricao"
                    name="data_fim_inscricao"
                    type="date"
                    value={formData.data_fim_inscricao}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.data_fim_inscricao ? styles.inputError : ''}`}
                  />
                  {errors.data_fim_inscricao && <span className={styles.errorMessage}>{errors.data_fim_inscricao}</span>}
                </div>
              </div>
              </div>
            </div>



            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Configurações</h2>
              
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="valor_inscricao" className={styles.label}>Valor da Inscrição (R$) *</label>
                  <input
                    id="valor_inscricao"
                    name="valor_inscricao"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_inscricao}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.valor_inscricao ? styles.inputError : ''}`}
                    placeholder="0.00"
                  />
                  {errors.valor_inscricao && <span className={styles.errorMessage}>{errors.valor_inscricao}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="limite_participantes" className={styles.label}>Limite de Participantes *</label>
                  <input
                    id="limite_participantes"
                    name="limite_participantes"
                    type="number"
                    min="1"
                    value={formData.limite_participantes}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.limite_participantes ? styles.inputError : ''}`}
                    placeholder="100"
                  />
                  {errors.limite_participantes && <span className={styles.errorMessage}>{errors.limite_participantes}</span>}
                </div>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate(`/evento/${id}`)}
                className={styles.cancelButton}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EditEvent;
