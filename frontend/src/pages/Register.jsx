import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../utils/api/apiTaskManager';
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
    data_nascimento: ''
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
    
    if (!formData.username || !formData.email || !formData.password || !formData.nome) {
      setError('Por favor, preencha todos os campos obrigatórios.');
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
      
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nome: formData.nome,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento
      };
      
      await registerUser(registrationData);
      
      alert('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
      
    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.username) {
          setError('Este nome de usuário já está em uso.');
        } else if (errorData.email) {
          setError('Este email já está cadastrado.');
        } else {
          setError('Dados inválidos. Verifique as informações.');
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
              className={styles.input}
              placeholder="Digite seu nome completo"
              disabled={loading}
            />
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
              className={styles.input}
              placeholder="Escolha um nome de usuário"
              disabled={loading}
            />
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
              className={styles.input}
              placeholder="Digite seu email"
              disabled={loading}
            />
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
              className={styles.input}
              placeholder="Digite seu CPF"
              disabled={loading}
            />
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
              className={styles.input}
              disabled={loading}
            />
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
              className={styles.input}
              placeholder="Digite sua senha"
              disabled={loading}
            />
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
              className={styles.input}
              placeholder="Confirme sua senha"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.registerButton}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>

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
