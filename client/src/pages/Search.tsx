import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchRestaurants, type Restaurant } from '../api';
import RestaurantCard from '../components/RestaurantCard';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const keyword = params.get('keyword') ?? '';
  const page = parseInt(params.get('page') ?? '1');

  const [results, setResults] = useState<Restaurant[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [kw, setKw] = useState(keyword);

  useEffect(() => {
    searchRestaurants(keyword, 'all', page).then((data) => {
      setResults(data.results);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    });
  }, [keyword, page]);

  const onDeleted = (id: number) => setResults((prev) => prev.filter((restaurant) => restaurant.restaurant_id !== id));

  return (
    <div className="container">
      <Link className="back-link" to="/">← Back to Home</Link>

      <form className="search-bar" onSubmit={(e) => {
        e.preventDefault();
        setParams({ keyword: kw, page: '1' });
      }}>
        <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="🔍  Search restaurants…" />
        <button className="btn btn-primary">Search</button>
      </form>

      <div className="page-header">
        <h1>Search Results</h1>
        <p>{total} result{total !== 1 ? 's' : ''} for &ldquo;{keyword}&rdquo;</p>
      </div>

      {results.length === 0
        ? <div className="alert alert-info">No restaurants found. Try a different search term.</div>
        : <div className="card-grid">
            {results.map((restaurant) => <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} onDeleted={onDeleted} />)}
          </div>}

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) =>
            pageNum === page
              ? <strong key={pageNum}>{pageNum}</strong>
              : <a key={pageNum} onClick={() => setParams({ keyword, page: String(pageNum) })}>{pageNum}</a>
          )}
        </div>
      )}
    </div>
  );
}
