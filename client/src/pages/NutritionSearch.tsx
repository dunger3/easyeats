import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchNutrition, type NutritionItem } from '../api';

export default function NutritionSearch() {
  const navigate = useNavigate();
  const [item, setItem] = useState('');
  const [maxCal, setMaxCal] = useState('');
  const [results, setResults] = useState<NutritionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await searchNutrition(item, maxCal, pageNum);
      setResults(data.results);
      setTotal(data.total); 
      setTotalPages(data.totalPages);
      setPage(pageNum); 
      setSearched(true);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Link className="back-link" to="/">← Back to Home</Link>
      <div className="page-header">
        <h1>🥗 Nutrition Search</h1>
        <p>Search nutrition info across all restaurants</p>
      </div>

      <form className="search-bar" onSubmit={(e) => {
        e.preventDefault();
        run(1);
      }}>
        <input placeholder="🔍 Search by item name (e.g. Big Mac, salad...)"
          value={item} onChange={(e) => setItem(e.target.value)} />
        <input type="number" placeholder="Max calories" min={0}
          value={maxCal} onChange={(e) => setMaxCal(e.target.value)} style={{ maxWidth: 180 }} />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {!searched && (
        <div className="empty-state">
          <div className="icon">🥗</div>
          <p>Enter an item name or max calories to search.</p>
        </div>
      )}

      {searched && (
        <>
          <p className="hint" style={{ marginBottom: '.75rem' }}>
            {total} result{total !== 1 ? 's' : ''}
            {item && ` for "${item}"`}
            {maxCal && ` under ${maxCal} calories`}
          </p>

          {results.length === 0
            ? <div className="alert alert-info">No nutrition items found. Try a different search.</div>
            : <div className="table-wrap">
                <table className="table">
                  <thead><tr>
                    <th>Item</th><th>Restaurant</th>
                    <th className="num">Calories</th>
                    <th className="num">Protein (g)</th>
                    <th className="num">Sodium (mg)</th>
                  </tr></thead>
                  <tbody>
                    {results.map((row) => (
                      <tr key={row.nutrition_id} className="clickable"
                          onClick={() => navigate(`/restaurant/${row.restaurant_id}`)}>
                        <td>{row.item_name}</td>
                        <td className="restaurant-link">{row.restaurant?.name ?? `Restaurant #${row.restaurant_id}`}</td>
                        <td className="num">{row.calories ?? '—'}</td>
                        <td className="num">{row.protein !== null ? Number(row.protein).toFixed(1) : '—'}</td>
                        <td className="num">{row.sodium ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) =>
                pageNum === page ? <strong key={pageNum}>{pageNum}</strong> : <a key={pageNum} onClick={() => run(pageNum)}>{pageNum}</a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
