import searchIcon from "../../assets/search-icon.svg";
import leadingIcon from "../../assets/Leading-icon.svg";
import styles from './SearchBar.module.css';

function SearchBar({ placeholder = "Buscar evento...", onSearch, className = "" }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      const searchTerm = e.target.search.value;
      onSearch(searchTerm);
    }
  };

  return (
    <section className={`${styles.searchSection} ${className}`}>
      <div className={styles.searchContainer}>
        <form onSubmit={handleSubmit}>
          <button type="button" className={styles.leadingButton}>
            <img src={leadingIcon} alt="leading-icon" />
          </button>
          <input
            type="text"
            name="search"
            placeholder={placeholder}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            <img src={searchIcon} alt="search-icon" />
          </button>
        </form>
      </div>
    </section>
  );
}

export default SearchBar;
