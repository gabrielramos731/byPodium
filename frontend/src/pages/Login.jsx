import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api/apiTaskManager';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    
    if (!formData.email || !formData.password) {
      setError('Campos obrigatórios não preenchidos.');
      setFieldErrors({
        email: !formData.email ? 'Email é obrigatório' : '',
        password: !formData.password ? 'Senha é obrigatória' : ''
      });
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});
      
      const response = await loginUser(formData);
      
      localStorage.setItem('authToken', response.tokens.access);
      localStorage.setItem('refreshToken', response.tokens.refresh);
      localStorage.setItem('userId', response.user.id);
      
      navigate('/');
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.status === 400 || error.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
        setFieldErrors({
          email: 'Verifique seu email',
          password: 'Verifique sua senha'
        });
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/registro');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoText}>byPodium</span>
          </div>
          <h1 className={styles.title}>Bem-vindo de volta</h1>
          <p className={styles.subtitle}>Entre na sua conta para continuar</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
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
            <label htmlFor="password" className={styles.label}>
              Senha
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
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? 'Fazendo login...' : 'Fazer Login'}
            </button>
          </div>

          <div className={styles.registerSection}>
            <p className={styles.registerText}>
              Ainda não tem uma conta?{' '}
              <button
                type="button"
                onClick={handleRegisterRedirect}
                className={styles.registerLink}
                disabled={loading}
              >
                Registrar
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
