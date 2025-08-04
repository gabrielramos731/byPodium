import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import { getEventToManage, updateEvent, getEstados, getCidades } from '../utils/api/apiTaskManager';
import styles from './EditEvent.module.css';

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState({});
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    horario_inicio: '',
    horario_fim: '',
    uf: '',
    cidade: '',
    endereco: '',
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
          data_inicio: eventData.data_inicio || '',
          data_fim: eventData.data_fim || '',
          horario_inicio: eventData.horario_inicio || '',
          horario_fim: eventData.horario_fim || '',
          uf: eventData.localidade.uf || '',
          cidade: eventData.localidade.cidade || '',
          endereco: eventData.endereco || '',
          valor_inscricao: eventData.valor_inscricao || '',
          limite_participantes: eventData.limite_participantes || '',
          imagem: null
        };
        
        setFormData(formattedData);
        setOriginalData(formattedData);
        
        // Carregar cidades do estado selecionado
        if (formattedData.uf) {
          await loadCidades(formattedData.uf);
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados do evento:', error);
        alert('Erro ao carregar dados do evento. Verifique suas permissões.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const loadEstadosData = async () => {
      try {
        const estadosData = await getEstados();
        setEstados(estadosData);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      }
    };
    
    const fetchData = async () => {
      await loadEstadosData();
      await loadEventData();
    };
    
    fetchData();
  }, [id, navigate]);

  const loadCidades = async (estado) => {
    try {
      const cidadesData = await getCidades(estado);
      setCidades(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

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

    // Limpar erro do campo quando usuario digita
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Carregar cidades quando estado for selecionado
    if (name === 'uf' && value) {
      loadCidades(value);
      setFormData(prev => ({
        ...prev,
        cidade: '' // Limpar cidade selecionada
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

    if (!formData.horario_inicio) {
      newErrors.horario_inicio = 'Horário de início é obrigatório';
    }

    if (!formData.horario_fim) {
      newErrors.horario_fim = 'Horário de fim é obrigatório';
    }

    if (!formData.uf) {
      newErrors.uf = 'Estado é obrigatório';
    }

    if (!formData.cidade) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
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
        // Para imagem, apenas incluir se foi selecionada uma nova
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
      alert('Nenhuma alteração foi feita.');
      return;
    }

    setSubmitting(true);
    
    try {
      const eventData = new FormData();
      
      Object.keys(changedFields).forEach(key => {
        if (changedFields[key] !== '' && changedFields[key] !== null) {
          eventData.append(key, changedFields[key]);
        }
      });

      await updateEvent(id, eventData);
      
      alert('Evento atualizado com sucesso!');
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
        alert('Erro ao atualizar evento. Tente novamente.');
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
          
          <form onSubmit={handleSubmit} className={styles.form}>
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
                  <label htmlFor="data_inicio" className={styles.label}>Data de Início *</label>
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
                  <label htmlFor="data_fim" className={styles.label}>Data de Fim *</label>
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
                  <label htmlFor="horario_inicio" className={styles.label}>Horário de Início *</label>
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

                <div className={styles.inputGroup}>
                  <label htmlFor="horario_fim" className={styles.label}>Horário de Fim *</label>
                  <input
                    id="horario_fim"
                    name="horario_fim"
                    type="time"
                    value={formData.horario_fim}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.horario_fim ? styles.inputError : ''}`}
                  />
                  {errors.horario_fim && <span className={styles.errorMessage}>{errors.horario_fim}</span>}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Localização</h2>
              
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="uf" className={styles.label}>Estado *</label>
                  <select
                    id="uf"
                    name="uf"
                    value={formData.uf}
                    onChange={handleInputChange}
                    className={`${styles.select} ${errors.uf ? styles.inputError : ''}`}
                  >
                    <option value="">Selecione o estado</option>
                    {estados.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                  {errors.uf && <span className={styles.errorMessage}>{errors.uf}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="cidade" className={styles.label}>Cidade *</label>
                  <select
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    className={`${styles.select} ${errors.cidade ? styles.inputError : ''}`}
                    disabled={!formData.uf}
                  >
                    <option value="">Selecione a cidade</option>
                    {cidades.map(cidade => (
                      <option key={cidade} value={cidade}>{cidade}</option>
                    ))}
                  </select>
                  {errors.cidade && <span className={styles.errorMessage}>{errors.cidade}</span>}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="endereco" className={styles.label}>Endereço *</label>
                <input
                  id="endereco"
                  name="endereco"
                  type="text"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.endereco ? styles.inputError : ''}`}
                  placeholder="Digite o endereço completo"
                />
                {errors.endereco && <span className={styles.errorMessage}>{errors.endereco}</span>}
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
