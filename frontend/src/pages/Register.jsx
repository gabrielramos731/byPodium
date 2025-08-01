import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getEstados, getCidades } from '../utils/api/apiTaskManager';
import styles from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    rua: '',
    numero: '',
    bairro: '',
    estado: '',
    cidade: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingCidades, setLoadingCidades] = useState(false);

  // Carregar estados ao montar o componente
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoadingEstados(true);
        const estadosData = await getEstados();
        // Garantir que seja um array
        setEstados(Array.isArray(estadosData) ? estadosData : []);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        setError('Erro ao carregar estados. Tente recarregar a página.');
        setEstados([]); // Fallback para array vazio
      } finally {
        setLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    const fetchCidades = async () => {
      if (!formData.estado) {
        setCidades([]);
        return;
      }

      try {
        setLoadingCidades(true);
        const cidadesData = await getCidades(formData.estado);
        // Garantir que seja um array
        setCidades(Array.isArray(cidadesData) ? cidadesData : []);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        setCidades([]); // Fallback para array vazio
      } finally {
        setLoadingCidades(false);
      }
    };

    fetchCidades();
  }, [formData.estado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Se mudou o estado, limpar a cidade selecionada
    if (name === 'estado') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        cidade: '' // Limpar cidade quando estado mudar
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
    // Limpa o erro do campo específico quando o usuário digita
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.nome) {
      setError('Campos obrigatórios não preenchidos.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});
      
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nome: formData.nome,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        telefone: formData.telefone,
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        estado: formData.estado,
        cidade: formData.cidade
      };
      
      await registerUser(registrationData);
      
      alert('Usuário cadastrado com sucesso!');
      navigate('/login');
      
    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        
        // Processa erros específicos dos campos
        if (errorData.details) {
          const newFieldErrors = {};
          
          Object.keys(errorData.details).forEach(field => {
            if (Array.isArray(errorData.details[field])) {
              newFieldErrors[field] = errorData.details[field][0];
            } else {
              newFieldErrors[field] = errorData.details[field];
            }
          });
          
          setFieldErrors(newFieldErrors);
          setError('Campos obrigatórios não preenchidos.');
        } else {
          // Fallback para erros gerais
          if (errorData.username) {
            setFieldErrors({ username: 'Este nome de usuário já está em uso.' });
          } else if (errorData.email) {
            setFieldErrors({ email: 'Este email já está cadastrado.' });
          } else if (errorData.cpf) {
            setFieldErrors({ cpf: 'Este CPF já está cadastrado.' });
          }
          
          setError('Verifique os campos destacados.');
        }
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoText}>byPodium</span>
          </div>
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.subtitle}>Junte-se à comunidade de eventos</p>
        </div>

        <form className={styles.registerForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="nome" className={styles.label}>
              Nome completo *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.nome ? styles.inputError : ''}`}
              placeholder="Digite seu nome completo"
              disabled={loading}
            />
            {fieldErrors.nome && (
              <span className={styles.fieldError}>{fieldErrors.nome}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>
              Nome de usuário *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
              placeholder="Escolha um nome de usuário"
              disabled={loading}
            />
            {fieldErrors.username && (
              <span className={styles.fieldError}>{fieldErrors.username}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              placeholder="Digite seu email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cpf" className={styles.label}>
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.cpf ? styles.inputError : ''}`}
              placeholder="Digite seu CPF"
              disabled={loading}
            />
            {fieldErrors.cpf && (
              <span className={styles.fieldError}>{fieldErrors.cpf}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="data_nascimento" className={styles.label}>
              Data de nascimento
            </label>
            <input
              type="date"
              id="data_nascimento"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.data_nascimento ? styles.inputError : ''}`}
              disabled={loading}
            />
            {fieldErrors.data_nascimento && (
              <span className={styles.fieldError}>{fieldErrors.data_nascimento}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="telefone" className={styles.label}>
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.telefone ? styles.inputError : ''}`}
              placeholder="Digite seu telefone"
              disabled={loading}
            />
            {fieldErrors.telefone && (
              <span className={styles.fieldError}>{fieldErrors.telefone}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="rua" className={styles.label}>
              Rua
            </label>
            <input
              type="text"
              id="rua"
              name="rua"
              value={formData.rua}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.rua ? styles.inputError : ''}`}
              placeholder="Digite sua rua"
              disabled={loading}
            />
            {fieldErrors.rua && (
              <span className={styles.fieldError}>{fieldErrors.rua}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="numero" className={styles.label}>
              Número
            </label>
            <input
              type="text"
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.numero ? styles.inputError : ''}`}
              placeholder="Digite o número"
              disabled={loading}
            />
            {fieldErrors.numero && (
              <span className={styles.fieldError}>{fieldErrors.numero}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="bairro" className={styles.label}>
              Bairro
            </label>
            <input
              type="text"
              id="bairro"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.bairro ? styles.inputError : ''}`}
              placeholder="Digite seu bairro"
              disabled={loading}
            />
            {fieldErrors.bairro && (
              <span className={styles.fieldError}>{fieldErrors.bairro}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="estado" className={styles.label}>
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.estado ? styles.inputError : ''}`}
              disabled={loading || loadingEstados}
            >
              <option value="">
                {loadingEstados ? 'Carregando estados...' : 'Selecione um estado'}
              </option>
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {fieldErrors.estado && (
              <span className={styles.fieldError}>{fieldErrors.estado}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cidade" className={styles.label}>
              Cidade
            </label>
            <select
              id="cidade"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.cidade ? styles.inputError : ''}`}
              disabled={loading || !formData.estado || loadingCidades}
            >
              <option value="">
                {!formData.estado 
                  ? 'Selecione um estado primeiro'
                  : loadingCidades 
                    ? 'Carregando cidades...' 
                    : 'Selecione uma cidade'
                }
              </option>
              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
            {fieldErrors.cidade && (
              <span className={styles.fieldError}>{fieldErrors.cidade}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Senha *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
              placeholder="Digite sua senha"
              disabled={loading}
            />
            {fieldErrors.password && (
              <span className={styles.fieldError}>{fieldErrors.password}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar senha *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Confirme sua senha"
              disabled={loading}
            />
            {fieldErrors.confirmPassword && (
              <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              className={styles.registerButton}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Registrar'}
            </button>
          </div>

          <div className={styles.loginSection}>
            <p className={styles.loginText}>
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={handleLoginRedirect}
                className={styles.loginLink}
                disabled={loading}
              >
                Faça login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
