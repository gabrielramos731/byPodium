import styles from './Navigation.module.css'

function Navigation() {
  return (
    <section className={styles.sectionNav}>
      <nav className={styles.mainNav}>
        <a href="#" className={`${styles.navLink} ${styles.active}`}>
          Início
        </a>
        <a href="#" className={styles.navLink}>
          Minhas Inscrições
        </a>
        <a href="#" className={styles.navLink}>
          Meu Perfil
        </a>
      </nav>
    </section>
  );
}

export default Navigation;
