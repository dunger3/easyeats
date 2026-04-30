import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { deleteRestaurant, type Restaurant } from '../api';

export default function RestaurantCard({
  restaurant, onDeleted,
}: { restaurant: Restaurant; onDeleted?: (id: number) => void }) {
  const { isAdmin } = useAuth();
  const { restaurant_id, name, address, image_filename } = restaurant;

  const del = async () => {
    if (!confirm(`Delete "${name}"? This also removes its menu and comments.`)) 
      return;
    try {
      await deleteRestaurant(restaurant_id);
      onDeleted?.(restaurant_id);
    }
    catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="card">
      {image_filename
        ? <img className="card-img" src={`/uploads/${image_filename}`} alt={name} />
        : <div className="card-img-ph">🍽</div>}
      <div className="card-body">
        <Link className="card-title" to={`/restaurant/${restaurant_id}`}>{name}</Link>
        <p className="card-addr">📍 {address}</p>
        <div className="card-actions">
          <Link className="btn btn-primary btn-sm" to={`/restaurant/${restaurant_id}`}>View</Link>
          {isAdmin && (
            <>
              <Link className="btn btn-sm" to={`/edit/${restaurant_id}`}>Edit</Link>
              <button className="btn btn-danger btn-sm" onClick={del}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
