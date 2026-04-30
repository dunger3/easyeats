import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createRestaurant, updateRestaurant, getRestaurant, type Restaurant,
} from '../api';
import { useAuth } from '../auth';

export default function RestaurantForm() {
  const { id } = useParams<{ id: string }>();
  const editing = !!id;
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [existing, setExisting] = useState<Restaurant | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (editing) {
      getRestaurant(Number(id)).then((r) => {
        setExisting(r);
        setName(r.name);
        setAddress(r.address);
      });
    }
  }, [id, editing, isLoggedIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setError('Name and address are required.'); return;
    }
    const fd = new FormData();
    fd.append('name', name);
    fd.append('address', address);
    if (editing) fd.append('deleteImage', String(deleteImage));
    if (image) fd.append('image', image);

    setLoading(true);
    setError('');
    try {
      if (editing) {
        await updateRestaurant(Number(id), fd);
        navigate(`/restaurant/${id}`);
      }
      else {
        await createRestaurant(fd);
        navigate('/');
      }
    }
    catch (err: any) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  };

  if (editing && !existing) return <div className="container"><p>Loading…</p></div>;

  return (
    <div className="container">
      <Link className="back-link" to={editing ? `/restaurant/${id}` : '/'}>
        ← {editing ? 'Back to Restaurant' : 'Back to Home'}
      </Link>
      <div className="form-card">
        <h2>{editing ? '✏ Edit Restaurant' : '+ Add Restaurant'}</h2>
        {error && <div className="alert alert-error">⚠ {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group"><label>Restaurant Name</label>
            <input className="form-control" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Golden Fork" /></div>
          <div className="form-group"><label>Address</label>
            <input className="form-control" required value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Winnipeg" /></div>

          {editing && existing?.image_filename && (
            <div className="form-group">
              <label>Current Photo</label>
              <img src={`/uploads/${existing.image_filename}`} alt="Current"
                style={{ maxWidth: 200, borderRadius: 8, display: 'block', marginBottom: '.5rem' }} />
              <label className="row" style={{ gap: '.4rem' }}>
                <input type="checkbox" checked={deleteImage} onChange={(e) => setDeleteImage(e.target.checked)} />
                <span>Remove current photo</span>
              </label>
            </div>
          )}

          <div className="form-group">
            <label>
              {editing && existing?.image_filename ? 'Replace Photo' : 'Add Photo'}{' '}
              <span className="hint">(optional)</span>
            </label>
            <input className="form-control" type="file" accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Saving…' : editing ? 'Save Changes' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
