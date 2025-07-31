import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api/apiTaskManager';
import styles from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await loginUser(formData);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.user_id);
      
      navigate('/');
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.status === 400) {
        setError('Credenciais inválidas. Verifique seu usuário e senha.');
      } else if (error.response?.status === 401) {
        setError('Usuário ou senha incorretos.');
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
            <label htmlFor="username" className={styles.label}>
              Usuário
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              placeholder="Digite seu usuário"
              disabled={loading}
            />
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
              className={styles.input}
              placeholder="Digite sua senha"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className={styles.registerSection}>
            <p className={styles.registerText}>
              Ainda não tem uma conta?{' '}
              <button
                type="button"
                onClick={handleRegisterRedirect}
                className={styles.registerLink}
                disabled={loading}
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
