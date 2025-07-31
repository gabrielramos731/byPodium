import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css'

function Navigation() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <section className={styles.sectionNav}>
      <nav className={styles.mainNav}>
        <a href="/" className={`${styles.navLink} ${styles.active}`}>
          Início
        </a>
        {isLoggedIn && (
          <>
            <a href="#" className={styles.navLink}>
              Minhas Inscrições
            </a>
            <a href="/meu-perfil" className={styles.navLink}>
              Meu Perfil
            </a>
          </>
        )}
      </nav>
      
      <div className={styles.authSection}>
        {isLoggedIn ? (
          <button onClick={handleLogout} className={styles.authButton}>
            Sair
          </button>
        ) : (
          <button onClick={handleLogin} className={styles.authButton}>
            Entrar
          </button>
        )}
      </div>
    </section>
  );
}

export default Navigation;
