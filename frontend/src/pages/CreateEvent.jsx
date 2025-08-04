import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/navigation/Navigation';
import Footer from '../components/footer/Footer';
import { createEvent, getEstados, getCidades } from '../utils/api/apiTaskManager';
import styles from './CreateEvent.module.css';

function CreateEvent() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    data_inicio_inscricao: '',
    data_fim_inscricao: '',
    horario_inicio: '',
    uf: '',
    cidade: '',
    valor_inscricao: '',
    limite_participantes: '',
    imagem: null
  });

  const [categorias, setCategorias] = useState([{
    nome: '',
    sexo: '',
    idadeMin: '',
    idadeMax: ''
  }]);
  const [kits, setKits] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadEstados();
  }, []);

  const loadEstados = async () => {
    try {
      const estadosData = await getEstados();
      setEstados(estadosData);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
    }
  };

  const loadCidades = async (estado) => {
    try {
      const cidadesData = await getCidades(estado);
      setCidades(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  // Funções para gerenciar categorias
  const addCategoria = () => {
    setCategorias([...categorias, {
      nome: '',
      sexo: '',
      idadeMin: '',
      idadeMax: ''
    }]);
    
    // Limpar erro de categorias
    if (errors.categorias) {
      setErrors(prev => ({
        ...prev,
        categorias: null
      }));
    }
  };

  const removeCategoria = (index) => {
    // Não permite remover se há apenas uma categoria
    if (categorias.length > 1) {
      setCategorias(categorias.filter((_, i) => i !== index));
    }
  };

  const updateCategoria = (index, field, value) => {
    const updatedCategorias = categorias.map((categoria, i) => 
      i === index ? { ...categoria, [field]: value } : categoria
    );
    setCategorias(updatedCategorias);
    
    // Limpar erro de categorias quando usuário estiver preenchendo
    if (errors.categorias) {
      setErrors(prev => ({
        ...prev,
        categorias: null
      }));
    }
  };

  // Funções para gerenciar kits
  const addKit = () => {
    setKits([...kits, {
      nome: '',
      precoExtra: '',
      itens: []
    }]);
  };

  const removeKit = (index) => {
    setKits(kits.filter((_, i) => i !== index));
  };

  const updateKit = (index, field, value) => {
    const updatedKits = kits.map((kit, i) => 
      i === index ? { ...kit, [field]: value } : kit
    );
    setKits(updatedKits);
  };

  const addItemToKit = (kitIndex) => {
    const updatedKits = kits.map((kit, i) => 
      i === kitIndex ? {
        ...kit,
        itens: [...kit.itens, { nome: '', tamanho: '' }]
      } : kit
    );
    setKits(updatedKits);
  };

  const removeItemFromKit = (kitIndex, itemIndex) => {
    const updatedKits = kits.map((kit, i) => 
      i === kitIndex ? {
        ...kit,
        itens: kit.itens.filter((_, j) => j !== itemIndex)
      } : kit
    );
    setKits(updatedKits);
  };

  const updateKitItem = (kitIndex, itemIndex, field, value) => {
    const updatedKits = kits.map((kit, i) => 
      i === kitIndex ? {
        ...kit,
        itens: kit.itens.map((item, j) => 
          j === itemIndex ? { ...item, [field]: value } : item
        )
      } : kit
    );
    setKits(updatedKits);
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

    if (!formData.uf) {
      newErrors.uf = 'Estado é obrigatório';
    }

    if (!formData.cidade) {
      newErrors.cidade = 'Cidade é obrigatória';
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

    // Validação de categorias - obrigatório
    if (categorias.length === 0) {
      newErrors.categorias = 'Pelo menos uma categoria deve ser adicionada';
    } else {
      const categoriasValidas = categorias.filter(cat => 
        cat.nome && cat.sexo && cat.idadeMin !== '' && cat.idadeMax !== ''
      );
      if (categoriasValidas.length === 0) {
        newErrors.categorias = 'Pelo menos uma categoria deve estar completamente preenchida';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para envio
      const eventData = {
        nome: formData.nome,
        descricao: formData.descricao,
        dataIni: formData.data_inicio,
        dataFim: formData.data_fim,
        horarioIni: formData.horario_inicio,
        dataIniInsc: formData.data_inicio_inscricao,
        dataFimInsc: formData.data_fim_inscricao,
        limiteQuantInsc: parseInt(formData.limite_participantes),
        valorInsc: parseFloat(formData.valor_inscricao),
        uf: formData.uf,
        cidade: formData.cidade
      };

      // Adicionar categorias se existirem
      if (categorias.length > 0) {
        eventData.categorias = categorias.filter(cat => 
          cat.nome && cat.sexo && cat.idadeMin !== '' && cat.idadeMax !== ''
        ).map(cat => ({
          nome: cat.nome,
          sexo: cat.sexo,
          idadeMin: parseInt(cat.idadeMin),
          idadeMax: parseInt(cat.idadeMax)
        }));
      }

      // Adicionar kits se existirem
      if (kits.length > 0) {
        eventData.kits = kits.filter(kit => 
          kit.nome && kit.precoExtra !== ''
        ).map(kit => ({
          nome: kit.nome,
          precoExtra: parseFloat(kit.precoExtra),
          itens: kit.itens.filter(item => item.nome && item.tamanho)
        }));
      }

      // Se há imagem, usar FormData
      let finalEventData;
      if (formData.imagem) {
        finalEventData = new FormData();
        Object.keys(eventData).forEach(key => {
          if (key === 'categorias' || key === 'kits') {
            finalEventData.append(key, JSON.stringify(eventData[key]));
          } else {
            finalEventData.append(key, eventData[key]);
          }
        });
        finalEventData.append('imagem', formData.imagem);
      } else {
        finalEventData = eventData;
      }

      const response = await createEvent(finalEventData);
      
      alert('Evento criado com sucesso!');
      navigate(`/evento/${response.id}`);
      
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
        alert('Erro ao criar evento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Criar Novo Evento</h1>
          
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
                <label htmlFor="imagem" className={styles.label}>Imagem do Evento</label>
                <input
                  id="imagem"
                  name="imagem"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className={styles.input}
                />
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

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Categorias *</h2>
              <p className={styles.sectionDescription}>
                Defina categorias por faixa etária e sexo para o evento (obrigatório)
              </p>
              {errors.categorias && <span className={styles.errorMessage}>{errors.categorias}</span>}
              
              {categorias.map((categoria, index) => (
                <div key={index} className={styles.categoriaItem}>
                  <div className={styles.categoriaHeader}>
                    <h4>Categoria {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCategoria(index)}
                      className={styles.removeButton}
                      disabled={categorias.length === 1}
                      title={categorias.length === 1 ? "Pelo menos uma categoria é obrigatória" : "Remover categoria"}
                    >
                      Remover
                    </button>
                  </div>
                  
                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Nome da Categoria</label>
                      <input
                        type="text"
                        value={categoria.nome}
                        onChange={(e) => updateCategoria(index, 'nome', e.target.value)}
                        className={styles.input}
                        placeholder="Ex: Masculino Sub 18"
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Sexo</label>
                      <select
                        value={categoria.sexo}
                        onChange={(e) => updateCategoria(index, 'sexo', e.target.value)}
                        className={styles.select}
                      >
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Idade Mínima</label>
                      <input
                        type="number"
                        min="0"
                        value={categoria.idadeMin}
                        onChange={(e) => updateCategoria(index, 'idadeMin', e.target.value)}
                        className={styles.input}
                        placeholder="16"
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Idade Máxima</label>
                      <input
                        type="number"
                        min="0"
                        value={categoria.idadeMax}
                        onChange={(e) => updateCategoria(index, 'idadeMax', e.target.value)}
                        className={styles.input}
                        placeholder="18"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCategoria}
                className={styles.addButton}
              >
                + Adicionar Categoria
              </button>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Kits (Opcional)</h2>
              <p className={styles.sectionDescription}>
                Configure kits de itens que os participantes podem adquirir
              </p>
              
              {kits.map((kit, kitIndex) => (
                <div key={kitIndex} className={styles.kitItem}>
                  <div className={styles.kitHeader}>
                    <h4>Kit {kitIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeKit(kitIndex)}
                      className={styles.removeButton}
                    >
                      Remover
                    </button>
                  </div>
                  
                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Nome do Kit</label>
                      <input
                        type="text"
                        value={kit.nome}
                        onChange={(e) => updateKit(kitIndex, 'nome', e.target.value)}
                        className={styles.input}
                        placeholder="Ex: Kit Básico"
                      />
                    </div>
                    
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Preço Extra (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={kit.precoExtra}
                        onChange={(e) => updateKit(kitIndex, 'precoExtra', e.target.value)}
                        className={styles.input}
                        placeholder="25.00"
                      />
                    </div>
                  </div>
                  
                  <div className={styles.itensSection}>
                    <h5 className={styles.itensTitle}>Itens do Kit</h5>
                    
                    {kit.itens.map((item, itemIndex) => (
                      <div key={itemIndex} className={styles.itemRow}>
                        <div className={styles.inputGroup}>
                          <input
                            type="text"
                            value={item.nome}
                            onChange={(e) => updateKitItem(kitIndex, itemIndex, 'nome', e.target.value)}
                            className={styles.input}
                            placeholder="Nome do item"
                          />
                        </div>
                        
                        <div className={styles.inputGroup}>
                          <select
                            value={item.tamanho}
                            onChange={(e) => updateKitItem(kitIndex, itemIndex, 'tamanho', e.target.value)}
                            className={styles.select}
                          >
                            <option value="">Tamanho</option>
                            <option value="pp">PP</option>
                            <option value="p">P</option>
                            <option value="m">M</option>
                            <option value="g">G</option>
                            <option value="gg">GG</option>
                          </select>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeItemFromKit(kitIndex, itemIndex)}
                          className={styles.removeItemButton}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => addItemToKit(kitIndex)}
                      className={styles.addItemButton}
                    >
                      + Adicionar Item
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addKit}
                className={styles.addButton}
              >
                + Adicionar Kit
              </button>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className={styles.cancelButton}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CreateEvent;
