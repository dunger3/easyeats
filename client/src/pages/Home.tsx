import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurants, type Restaurant } from '../api';
import RestaurantCard from '../components/RestaurantCard';

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getRestaurants().then(setRestaurants);
  }, []);

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const onDeleted = (id: number) => setRestaurants((prevRest) => prevRest.filter((restaurant) => restaurant.restaurant_id !== id));

  return (
    <div className="container">
      <form className="search-bar" onSubmit={search}>
        <input placeholder="🔍  Search restaurants..." value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="page-header">
        <h1>All Restaurants</h1>
        <p>Discover great places to eat near you</p>
      </div>
      <div className="card-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} onDeleted={onDeleted} />
        ))}
      </div>
    </div>
  );
}