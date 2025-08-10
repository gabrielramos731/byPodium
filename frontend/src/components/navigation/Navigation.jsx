import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navigation.module.css";

function Navigation() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <section className={styles.sectionNav}>
      <nav className={styles.mainNav}>
        <a href="/" className={`${styles.navLink} ${styles.active}`}>
          Início
        </a>
        {isLoggedIn && (
          <>
            <a href="/minhas-inscricoes" className={styles.navLink}>
              Minhas Inscrições
            </a>
            <a href="/meu-perfil" className={styles.navLink}>
              Meu Perfil
            </a>
            <a href="/relatorios" className={styles.navLink}>
              Relatórios
            </a>
          </>
        )}
        <div className={styles.authSection}>
          {isLoggedIn ? (
            <a href="#" onClick={handleLogout} className={styles.navLink}>
              Sair
            </a>
          ) : (
            <button onClick={handleLogin} className={styles.loginButton}>
              Fazer Login
            </button>
          )}
        </div>
      </nav>
    </section>
  );
}

export default Navigation;
