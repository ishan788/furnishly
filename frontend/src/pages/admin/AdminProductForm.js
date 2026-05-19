import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, categoryAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ROOM_TYPES = ['Living Room','Bedroom','Dining Room','Office','Outdoor','Bathroom','Kitchen','Kids Room'];

const emptyForm = {
  name: '', description: '', shortDescription: '', price: '', discountPrice: '',
  category: '', brand: '', stock: '', sku: '', materials: '', features: '', tags: '',
  roomType: [], images: [], isFeatured: false, isNewArrival: false, isBestseller: false,
  assemblyRequired: false, warrantyYears: 1, returnDays: 30, deliveryDays: 7,
  dimensions: { length: '', width: '', height: '', weight: '' },
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState(['']);

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories)).catch(() => {});
    if (isEdit) {
      productAPI.getOne(id).then(({ data }) => {
        const p = data.product;
        setForm({
          ...p,
          materials: p.materials?.join(', ') || '',
          features: p.features?.join('\n') || '',
          tags: p.tags?.join(', ') || '',
          category: p.category?._id || '',
        });
        setImageUrls(p.images?.length ? p.images : ['']);
      }).catch(() => toast.error('Failed to load product'));
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setDim = (key, val) => setForm(f => ({ ...f, dimensions: { ...f.dimensions, [key]: val } }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const { data } = await uploadAPI.uploadImages(fd);
      const urls = data.images.map(i => i.url);
      setImageUrls(prev => {
        const filtered = prev.filter(u => u && u !== '');
        return [...filtered, ...urls];
      });
      toast.success(`${urls.length} image(s) uploaded`);
    } catch { toast.error('Image upload failed. Check Cloudinary config.'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      stock: Number(form.stock),
      warrantyYears: Number(form.warrantyYears),
      returnDays: Number(form.returnDays),
      deliveryDays: Number(form.deliveryDays),
      materials: form.materials ? form.materials.split(',').map(s => s.trim()).filter(Boolean) : [],
      features: form.features ? form.features.split('\n').map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      images: imageUrls.filter(Boolean),
      dimensions: {
        length: Number(form.dimensions.length) || 0,
        width: Number(form.dimensions.width) || 0,
        height: Number(form.dimensions.height) || 0,
        weight: Number(form.dimensions.weight) || 0,
      },
    };
    try {
      if (isEdit) { await productAPI.update(id, payload); toast.success('Product updated!'); }
      else { await productAPI.create(payload); toast.success('Product created!'); }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--clr-border)', borderRadius: 'var(--radius-sm)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', background: 'white' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--clr-text-muted)', marginBottom: 6 };
  const sectionStyle = { background: 'white', border: '1px solid var(--clr-border)', borderRadius: 'var(--radius-md)', padding: 28, marginBottom: 24 };

  const Checkbox = ({ label, field }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
      <input type="checkbox" checked={form[field]} onChange={e => set(field, e.target.checked)} style={{ accentColor: 'var(--clr-ink)', width: 16, height: 16 }} />
      {label}
    </label>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p>{isEdit ? 'Update product information' : 'Fill in the details to add a new product'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
          <div>
            {/* Basic info */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Basic Information</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Product Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Short Description</label>
                <input style={inputStyle} value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} placeholder="Brief tagline shown in listings" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Description *</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }} value={form.description} onChange={e => set('description', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>SKU</label>
                  <input style={inputStyle} value={form.sku} onChange={e => set('sku', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Pricing & Stock</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[['price','MRP (₹) *',true],['discountPrice','Sale Price (₹)'],['stock','Stock Qty *',true]].map(([field, label, req]) => (
                  <div key={field}>
                    <label style={labelStyle}>{label}</label>
                    <input type="number" style={inputStyle} value={form[field]} onChange={e => set(field, e.target.value)} required={req} min="0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Materials & Features</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Materials (comma-separated)</label>
                <input style={inputStyle} value={form.materials} onChange={e => set('materials', e.target.value)} placeholder="Solid Teak, Leather, Steel" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Features (one per line)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.features} onChange={e => set('features', e.target.value)} placeholder="Soft-close drawers&#10;USB ports in headboard" />
              </div>
              <div>
                <label style={labelStyle}>Tags (comma-separated)</label>
                <input style={inputStyle} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="sofa, leather, modern" />
              </div>
            </div>

            {/* Dimensions */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 20 }}>Dimensions (cm / kg)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {['length','width','height','weight'].map(d => (
                  <div key={d}>
                    <label style={labelStyle}>{d.charAt(0).toUpperCase() + d.slice(1)}</label>
                    <input type="number" style={inputStyle} value={form.dimensions?.[d]} onChange={e => setDim(d, e.target.value)} min="0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Room type */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Room Type</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {ROOM_TYPES.map(rt => (
                  <label key={rt} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14, padding: '6px 14px', border: `1.5px solid ${form.roomType?.includes(rt) ? 'var(--clr-ink)' : 'var(--clr-border)'}`, borderRadius: 100, background: form.roomType?.includes(rt) ? 'var(--clr-ink)' : 'white', color: form.roomType?.includes(rt) ? 'white' : 'var(--clr-ink)', transition: 'var(--transition)' }}>
                    <input type="checkbox" style={{ display: 'none' }} checked={form.roomType?.includes(rt)} onChange={e => set('roomType', e.target.checked ? [...(form.roomType || []), rt] : form.roomType.filter(r => r !== rt))} />
                    {rt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            {/* Images */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Images</h3>
              <label style={{ display: 'block', padding: '20px', border: '2px dashed var(--clr-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', marginBottom: 16, transition: 'var(--transition)' }}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                <p style={{ fontSize: 14, color: 'var(--clr-text-muted)' }}>{uploading ? '⏳ Uploading...' : '📎 Click to upload images'}</p>
                <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>JPG, PNG, WebP — max 5MB each</p>
              </label>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Or paste image URLs</label>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={url} onChange={e => { const u = [...imageUrls]; u[i] = e.target.value; setImageUrls(u); }} placeholder="https://..." />
                    <button type="button" onClick={() => setImageUrls(u => u.filter((_, j) => j !== i))} style={{ padding: '0 10px', color: 'var(--clr-red)', border: '1px solid var(--clr-border)', borderRadius: 4, cursor: 'pointer', background: 'white' }}>×</button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setImageUrls(u => [...u, ''])}>+ Add URL</button>
              </div>
              {imageUrls.filter(Boolean).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {imageUrls.filter(Boolean).map((url, i) => <img key={i} src={url} alt={`Product ${i+1}`} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 4 }} onError={e => e.target.style.display='none'} />)}
                </div>
              )}
            </div>

            {/* Category */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Category *</h3>
              <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Delivery */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Shipping & Policy</h3>
              {[['deliveryDays','Delivery Days'],['warrantyYears','Warranty (Years)'],['returnDays','Return Days']].map(([field, label]) => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{label}</label>
                  <input type="number" style={inputStyle} value={form[field]} onChange={e => set(field, e.target.value)} min="0" />
                </div>
              ))}
            </div>

            {/* Flags */}
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16 }}>Labels & Flags</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Checkbox label="Featured product" field="isFeatured" />
                <Checkbox label="New arrival" field="isNewArrival" />
                <Checkbox label="Bestseller" field="isBestseller" />
                <Checkbox label="Assembly required" field="assemblyRequired" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" className="btn btn-outline btn-block" style={{ marginTop: 12 }} onClick={() => navigate('/admin/products')}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
