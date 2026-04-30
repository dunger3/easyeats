import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getRestaurant, getCaptcha, postComment,
  getNutritionForRestaurant, uploadNutritionCsv, clearNutrition,
  type Restaurant, type CaptchaData, type NutritionItem,
} from '../api';
import { useAuth } from '../auth';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const rid = Number(id);
  const { isAdmin } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [form, setForm] = useState({ name: '', comment: '', captcha_code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [posting, setPosting] = useState(false);

  // Nutrition
  const [nutrition, setNutrition] = useState<NutritionItem[]>([]);
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState('');
  const [maxCal, setMaxCal] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvMsg, setCsvMsg] = useState('');
  const [csvErr, setCsvErr] = useState('');

  const reload        = () => getRestaurant(rid).then(setRestaurant);
  const reloadCaptcha = () => getCaptcha().then(setCaptcha);
  const reloadNut     = () => getNutritionForRestaurant(rid).then(setNutrition);

  useEffect(() => { reload(); reloadCaptcha(); reloadNut(); }, [rid]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!captcha) return;
    setPosting(true);
    try {
      await postComment(rid, { ...form, captcha_token: captcha.token });
      setForm({ name: '', comment: '', captcha_code: '' });
      setSuccess('Comment posted!');
      await reload();
      await reloadCaptcha();
    }
    catch (err: any) {
      setError(err.message);
      reloadCaptcha();
    }
    finally {
      setPosting(false);
    }
  };

  const uploadCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setCsvMsg('');
    setCsvErr('');
    try {
      const result = await uploadNutritionCsv(rid, csvFile);
      setCsvMsg(result.message);
      setCsvFile(null);
      const input = document.getElementById('csv-input') as HTMLInputElement | null;
      if (input) input.value = '';
      await reloadNut();
      setOpen(true);
    }
    catch (err: any) {
      setCsvErr(err.message);
    }
  };

  const clearNut = async () => {
    if (!confirm('Remove all nutrition data for this restaurant?')) return;
    try {
      await clearNutrition(rid);
      setNutrition([]);
      setCsvMsg('Nutrition data cleared.');
    }
    catch (err: any) {
      setCsvErr(err.message);
    }
  };

  const filtered = nutrition.filter((item) => {
    const nameOk = item.item_name.toLowerCase().includes(filter.toLowerCase());
    const calOk  = maxCal === '' || (item.calories !== null && item.calories <= parseInt(maxCal));
    return nameOk && calOk;
  });

  if (!restaurant) return <div className="container"><p>Loading…</p></div>;
  const { name, address, image_filename, comments = [] } = restaurant;

  return (
    <div className="container">
      <Link className="back-link" to="/">← All Restaurants</Link>

      <div className="hero">
        {image_filename
          ? <img className="hero-img" src={`/uploads/${image_filename}`} alt={name} />
          : <div className="hero-ph">🍽</div>}
        <div className="hero-body">
          <h1>{name}</h1>
          <p className="addr">📍 {address}</p>
          {isAdmin && <Link className="btn btn-sm" to={`/edit/${rid}`}>✏ Edit</Link>}
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>🥗 Nutrition Info</h2>
        {nutrition.length > 0 && (
          <button className="btn btn-sm" onClick={() => setOpen((isOpen) => !isOpen)}>
            {open ? '▲ Collapse' : '▼ Expand'}
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="panel">
          {csvMsg && <div className="alert alert-success">{csvMsg}</div>}
          {csvErr && <div className="alert alert-error">⚠ {csvErr}</div>}
          <form className="row" onSubmit={uploadCsv}>
            <input id="csv-input" className="form-control" type="file" accept=".csv,text/csv"
              style={{ flex: 1, minWidth: 180 }}
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)} />
            <button className="btn btn-primary btn-sm" disabled={!csvFile}>⬆ Upload CSV</button>
            {nutrition.length > 0 && (
              <button type="button" className="btn btn-danger btn-sm" onClick={clearNut}>Clear Data</button>
            )}
          </form>
        </div>
      )}

      {open && nutrition.length > 0 && (
        <>
          <div className="row" style={{ marginBottom: '.75rem' }}>
            <input className="form-control" placeholder="🔍 Filter by item name…"
              value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 2, minWidth: 180 }} />
            <input className="form-control" type="number" placeholder="Max calories" min={0}
              value={maxCal} onChange={(e) => setMaxCal(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
            {(filter || maxCal) && (
              <button className="btn btn-sm" onClick={() => {
                setFilter('');
                setMaxCal('');
              }}>Clear</button>
            )}
          </div>

          {filtered.length === 0
            ? <div className="alert alert-info">No items match your filter.</div>
            : <div className="table-wrap">
                <table className="table">
                  <thead><tr>
                    <th>Item</th><th className="num">Calories</th>
                    <th className="num">Protein (g)</th><th className="num">Sodium (mg)</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.nutrition_id}>
                        <td>{item.item_name}</td>
                        <td className="num">{item.calories ?? '—'}</td>
                        <td className="num">{item.protein !== null ? Number(item.protein).toFixed(1) : '—'}</td>
                        <td className="num">{item.sodium ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>}
          <p className="hint">Showing {filtered.length} of {nutrition.length} items</p>
        </>
      )}

      {open && nutrition.length === 0 && !isAdmin && (
        <p className="hint">No nutrition information available for this restaurant yet.</p>
      )}

      {!open && nutrition.length > 0 && (
        <p className="hint">
          {nutrition.length} items hidden —{' '}
          <button className="back-link" style={{ display: 'inline' }} onClick={() => setOpen(true)}>
            click Expand to view
          </button>
        </p>
      )}

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h2>💬 Leave a Comment</h2>
        {error   && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={submitComment}>
          <div className="form-group"><label>Your Name</label>
            <input className="form-control" required value={form.name} onChange={set('name')} /></div>
          <div className="form-group"><label>Comment</label>
            <textarea className="form-control" required value={form.comment} onChange={set('comment')}
              placeholder="Share your experience..." /></div>
          <div className="form-group">
            <label>CAPTCHA</label>
            {captcha && (
              <div>
                <div className="captcha-img" title="Click to refresh" onClick={reloadCaptcha}
                  dangerouslySetInnerHTML={{ __html: captcha.svg }} />
                <p className="hint" style={{ marginBottom: '.4rem' }}>Click the image to refresh</p>
              </div>
            )}
            <input className="form-control" required placeholder="Enter the code above"
              value={form.captcha_code} onChange={set('captcha_code')} />
          </div>
          <button className="btn btn-primary" disabled={posting}>
            {posting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      </div>

      <h2 className="section-title">💬 Comments</h2>
      {comments.length > 0
        ? [...comments].reverse().map((comment) => (
            <div className="comment" key={comment.comment_id}>
              <div className="comment-author">{comment.name}</div>
              <div className="comment-text">{comment.comment}</div>
              <div className="comment-date">📅 {new Date(comment.created_at).toLocaleString()}</div>
            </div>
          ))
        : <p className="hint">No comments yet. Be the first!</p>}
    </div>
  );
}
