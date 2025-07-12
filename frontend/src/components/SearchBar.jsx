import searchIcon from "../assets/search-icon.svg";
import leadingIcon from "../assets/Leading-icon.svg";
import './SearchBar.css';

function SearchBar({ placeholder = "Buscar evento...", onSearch, className = "" }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      const searchTerm = e.target.search.value;
      onSearch(searchTerm);
    }
  };

  return (
    <section className={`search-section ${className}`}>
      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <button type="button" className="leading-button">
            <img src={leadingIcon} alt="leading-icon" />
          </button>
          <input
            type="text"
            name="search"
            placeholder={placeholder}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="search-icon" />
          </button>
        </form>
      </div>
    </section>
  );
}

export default SearchBar;
