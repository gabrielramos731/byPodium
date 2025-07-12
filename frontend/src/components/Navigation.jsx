import './Navigation.css'

function Navigation() {
  return (
    <section className="section-nav">
      <nav className="main-nav">
        <a href="#" className="nav-link active">
          Início
        </a>
        <a href="#" className="nav-link">
          Minhas Inscrições
        </a>
        <a href="#" className="nav-link">
          Meu Perfil
        </a>
      </nav>
    </section>
  );
}

export default Navigation;
