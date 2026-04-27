import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/authService';
import {
  adminGetAllProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../../services/adminProductService';
import {
  adminGetAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../../services/adminCategoryService';
import {
  adminGetAllStock,
  adminUpdateStock,
} from '../../services/adminStockService';
import { adminGetStats } from '../../services/adminDashboardService';
import { adminGetAllUsers, adminDeleteUser } from '../../services/adminUserService';
import { uploadImage } from '../../services/cloudinary';
import './AdminPanel.css';

const getApiErrorMessage = (err, fallback) => {
  const responseData = err?.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) return responseData;
  if (responseData?.message) return responseData.message;
  if (err?.message) return err.message;
  return fallback;
};

const ALL_COLORS = ['Black', 'White', 'Navy', 'Grey', 'Tan', 'Red', 'Blue', 'Green'];
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  imageUrl: '',
  isAvailable: true,
  bestSeller: false,
  availableColors: [],
  availableSizes: [],
};

const EMPTY_CAT_FORM = {
  categoryName: '',
  imageUrl: '',
};

export default function AdminPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    const userDetails = authService.getUserDetails();
    const isAdmin = userDetails && userDetails.role === 'ADMIN';
    if (!isAdmin) navigate('/');
  }, [navigate]);

  const userDetails = authService.getUserDetails();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAction, setActiveAction] = useState('add');
  const [activeCatAction, setActiveCatAction] = useState('add');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [stockEdits, setStockEdits] = useState({});
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);
  const [catForm, setCatForm] = useState(EMPTY_CAT_FORM);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [message, setMessage] = useState('');
  const [catMessage, setCatMessage] = useState('');
  const [stockMessage, setStockMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
    fetchStock();
    fetchUsers();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'category') fetchCategories();
    if (activeTab === 'products') fetchCategories();
    if (activeTab === 'stock') fetchStock();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'orders') {
      const token = authService.getToken();
      if (token) {
        fetchOrders();
      } else {
        setTimeout(() => fetchOrders(), 500);
      }
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      const token = authService.getToken();
      const { data } = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(data);
    } catch (err) {
      setOrderMessage('Failed to load orders.');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const token = authService.getToken();
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, status: status.toUpperCase() } : o))
      );
      await axios.put(
        `/api/admin/orders/${id}/status`,
        { status: status.toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      alert('Failed to update order status');
      fetchOrders();
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await adminGetAllProducts();
      setProducts(data);
    } catch (err) {
      setMessage('Failed to load products.');
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminGetAllCategories();
      setCategories(data);
    } catch (err) {
      setCatMessage('Failed to load categories.');
    }
  };

  const fetchStock = async () => {
    try {
      const data = await adminGetAllStock();
      setStockList(data);
      const edits = {};
      data.forEach(p => { edits[p.productId] = p.stock; });
      setStockEdits(edits);
    } catch (err) {
      setStockMessage('Failed to load stock data.');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminGetAllUsers();
      setUsers(data);
    } catch (err) {
      setUserMessage('Failed to load users.');
    }
  };

  const handleStockChange = (productId, value) => {
    setStockEdits(prev => ({ ...prev, [productId]: value }));
  };

  const handleStockSave = async productId => {
    try {
      const newStock = parseInt(stockEdits[productId]);
      await adminUpdateStock(productId, newStock);
      setStockMessage('Stock updated successfully!');
      fetchStock();
      fetchStats();
    } catch (err) {
      setStockMessage('Failed to update stock.');
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCatChange = e => {
    const { name, value } = e.target;
    setCatForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.categoryId) {
      setMessage('Please select a category before saving the product.');
      return;
    }
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        try {
          setUploading(true);
          setMessage('Uploading image...');
          imageUrl = await uploadImage(imageFile);
        } catch (uploadErr) {
          imageUrl = form.imageUrl || '';
          setMessage(`Image upload failed (${getApiErrorMessage(uploadErr, 'Unknown upload error')}). Saving product without Cloudinary image.`);
        } finally {
          setUploading(false);
        }
      }
      await adminCreateProduct({
        ...form,
        imageUrl,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        availableColors: form.availableColors.join(','),
        availableSizes: form.availableSizes.join(','),
      });
      setMessage('Product added successfully!');
      setForm(EMPTY_FORM);
      setImageFile(null);
      fetchProducts();
      fetchStats();
    } catch (err) {
      setUploading(false);
      setMessage(`Failed to add product: ${getApiErrorMessage(err, 'Unknown error')}`);
    }
  };

  const handleSelectForEdit = product => {
    setSelectedProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      categoryId: product.categoryId || '',
      imageUrl: product.imageUrl || '',
      isAvailable: product.isAvailable ?? true,
      bestSeller: product.bestSeller ?? false,
      availableColors: product.availableColors ? product.availableColors.split(',') : [],
      availableSizes: product.availableSizes ? product.availableSizes.split(',') : [],
    });
  };

  const handleEdit = async e => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!form.categoryId) {
      setMessage('Please select a category before updating the product.');
      return;
    }
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        try {
          setUploading(true);
          setMessage('Uploading image...');
          imageUrl = await uploadImage(imageFile);
        } catch (uploadErr) {
          imageUrl = form.imageUrl || '';
          setMessage(`Image upload failed (${getApiErrorMessage(uploadErr, 'Unknown upload error')}). Updating product without Cloudinary image.`);
        } finally {
          setUploading(false);
        }
      }
      await adminUpdateProduct(selectedProduct.productId, {
        ...form,
        imageUrl,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        availableColors: form.availableColors.join(','),
        availableSizes: form.availableSizes.join(','),
      });
      setMessage('Product updated successfully!');
      setSelectedProduct(null);
      setForm(EMPTY_FORM);
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      setUploading(false);
      setMessage(`Failed to update product: ${getApiErrorMessage(err, 'Unknown error')}`);
    }
  };

  const handleDelete = async productId => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminDeleteProduct(productId);
      setMessage('Product deleted successfully!');
      fetchProducts();
      fetchStats();
    } catch (err) {
      setMessage('Failed to delete product.');
    }
  };

  const handleCatAdd = async e => {
    e.preventDefault();
    try {
      await adminCreateCategory(catForm);
      setCatMessage('Category added successfully!');
      setCatForm(EMPTY_CAT_FORM);
      fetchCategories();
      fetchStats();
    } catch (err) {
      setCatMessage('Failed to add category.');
    }
  };

  const handleSelectCatForEdit = category => {
    setSelectedCategory(category);
    setCatForm({
      categoryName: category.categoryName || '',
      imageUrl: category.imageUrl || '',
    });
  };

  const handleCatEdit = async e => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      await adminUpdateCategory(selectedCategory.categoryId, catForm);
      setCatMessage('Category updated successfully!');
      setSelectedCategory(null);
      setCatForm(EMPTY_CAT_FORM);
      fetchCategories();
    } catch (err) {
      setCatMessage('Failed to update category.');
    }
  };

  const handleCatDelete = async categoryId => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminDeleteCategory(categoryId);
      setCatMessage('Category deleted successfully!');
      fetchCategories();
      fetchStats();
    } catch (err) {
      setCatMessage('Failed to delete category.');
    }
  };

  const handleDeleteUser = async userId => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminDeleteUser(userId);
      setUserMessage('User deleted successfully!');
      fetchUsers();
      fetchStats();
    } catch (err) {
      setUserMessage('Failed to delete user.');
    }
  };

  const toggleArrayItem = (arr, item) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  return (
    <div className="admin-wrapper">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">INKA</div>
        <nav className="admin-nav">
          <button
            className={activeTab === 'dashboard' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            Dashboard
          </button>
          <button
            className={activeTab === 'products' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveTab('products')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
            Products
          </button>
          <button
            className={activeTab === 'category' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveTab('category')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            Category
          </button>
          <button
            className={activeTab === 'stock' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveTab('stock')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            Stock
          </button>
          <button
            className={activeTab === 'users' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveTab('users')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            Users
          </button>
          <button
            className={activeTab === 'orders' ? 'admin-nav-item active' : 'admin-nav-item'}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4z" /></svg>
            Orders
          </button>
        </nav>
        <a href="/" className="admin-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to site
        </a>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div className="admin-content">
            <div className="dashboard-header">
              <h1 className="dashboard-greeting">Overview</h1>
              <p className="dashboard-subtitle">Here's what's happening with your store today.</p>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon stat-icon-products">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Products</span>
                  <span className="stat-value">{stats?.totalProducts ?? '—'}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-categories">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Categories</span>
                  <span className="stat-value">{stats?.totalCategories ?? '—'}</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-users">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{stats?.totalUsers ?? '—'}</span>
                </div>
              </div>
              <div className={`stat-card ${stats?.lowStockCount > 0 ? 'stat-card-warning' : ''}`}>
                <div className="stat-icon stat-icon-stock">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                </div>
                <div className="stat-info">
                  <span className="stat-label">Low Stock Items</span>
                  <span className="stat-value">{stats?.lowStockCount ?? '—'}</span>
                </div>
              </div>
            </div>
            <div className="dashboard-quick-actions">
              <p className="dashboard-section-label">Quick Actions</p>
              <div className="quick-action-row">
                <button className="quick-action-btn" onClick={() => { setActiveTab('products'); setActiveAction('add'); }}>+ Add Product</button>
                <button className="quick-action-btn" onClick={() => { setActiveTab('category'); setActiveCatAction('add'); }}>+ Add Category</button>
                <button className="quick-action-btn" onClick={() => setActiveTab('stock')}>Manage Stock</button>
                <button className="quick-action-btn" onClick={() => setActiveTab('users')}>View Users</button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {activeTab === 'products' && (
          <div className="admin-content">
            <h2 className="admin-section-title">Products</h2>
            <div className="admin-actions">
              <button className={activeAction === 'add' ? 'active' : ''} onClick={() => { setActiveAction('add'); setForm(EMPTY_FORM); setSelectedProduct(null); }}>Add</button>
              <button className={activeAction === 'edit' ? 'active' : ''} onClick={() => setActiveAction('edit')}>Edit</button>
              <button className={activeAction === 'delete' ? 'active' : ''} onClick={() => setActiveAction('delete')}>Delete</button>
            </div>
            {message && <p className="admin-message">{message}</p>}

            {activeAction === 'add' && (
              <form className="admin-form" onSubmit={handleAdd}>
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} required />
                <label>Description</label>
                <input name="description" value={form.description} onChange={handleChange} />
                <label>Price</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                <label>Stock</label>
                <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
                <label>Category</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                </select>
                <label>Image URL (optional)</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/product-image.jpg" />
                <label>Product Image</label>
                <input type="file" accept="image/*" onChange={handleImageFileChange} />
                {imageFile && <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.25rem 0' }}>Selected: {imageFile.name}</p>}
                <label>Available Colors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {ALL_COLORS.map(color => (
                    <button type="button" key={color}
                      onClick={() => setForm(f => ({ ...f, availableColors: toggleArrayItem(f.availableColors, color) }))}
                      style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: form.availableColors.includes(color) ? '#111' : '#f5f5f5', color: form.availableColors.includes(color) ? '#fff' : '#333', borderColor: form.availableColors.includes(color) ? '#111' : '#ddd' }}>
                      {color}
                    </button>
                  ))}
                </div>
                <label>Available Sizes</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {ALL_SIZES.map(size => (
                    <button type="button" key={size}
                      onClick={() => setForm(f => ({ ...f, availableSizes: toggleArrayItem(f.availableSizes, size) }))}
                      style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: form.availableSizes.includes(size) ? '#111' : '#f5f5f5', color: form.availableSizes.includes(size) ? '#fff' : '#333', borderColor: form.availableSizes.includes(size) ? '#111' : '#ddd' }}>
                      {size}
                    </button>
                  ))}
                </div>
                <label className="checkbox-row"><input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange} /> Available</label>
                <label className="checkbox-row"><input name="bestSeller" type="checkbox" checked={form.bestSeller} onChange={handleChange} /> Best Seller</label>
                <div className="admin-form-buttons">
                  <button type="submit" className="btn-save" disabled={uploading}>{uploading ? 'Uploading...' : 'Save'}</button>
                  <button type="button" className="btn-cancel" onClick={() => { setForm(EMPTY_FORM); setImageFile(null); }}>Cancel</button>
                </div>
              </form>
            )}

            {activeAction === 'edit' && (
              <div className="admin-edit-panel">
                {!selectedProduct && (
                  <div className="admin-product-list">
                    <div className="admin-list-header"><span>Product Name</span><span>Action</span></div>
                    {products.map(p => (
                      <div key={p.productId} className="admin-product-row">
                        <span>{p.name}</span>
                        <button onClick={() => handleSelectForEdit(p)}>Edit</button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedProduct && (
                  <form className="admin-form" onSubmit={handleEdit}>
                    <p className="editing-label">Editing: <strong>{selectedProduct.name}</strong></p>
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required />
                    <label>Description</label>
                    <input name="description" value={form.description} onChange={handleChange} />
                    <label>Price</label>
                    <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                    <label>Stock</label>
                    <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required />
                    <label>Category</label>
                    <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                    </select>
                    <label>Image URL (optional)</label>
                    <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://example.com/product-image.jpg" />
                    <label>Product Image</label>
                    {form.imageUrl && <img src={form.imageUrl} alt="Current" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} />}
                    <input type="file" accept="image/*" onChange={handleImageFileChange} />
                    {imageFile && <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.25rem 0' }}>New file: {imageFile.name}</p>}
                    <label>Available Colors</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {ALL_COLORS.map(color => (
                        <button type="button" key={color}
                          onClick={() => setForm(f => ({ ...f, availableColors: toggleArrayItem(f.availableColors, color) }))}
                          style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: form.availableColors.includes(color) ? '#111' : '#f5f5f5', color: form.availableColors.includes(color) ? '#fff' : '#333', borderColor: form.availableColors.includes(color) ? '#111' : '#ddd' }}>
                          {color}
                        </button>
                      ))}
                    </div>
                    <label>Available Sizes</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {ALL_SIZES.map(size => (
                        <button type="button" key={size}
                          onClick={() => setForm(f => ({ ...f, availableSizes: toggleArrayItem(f.availableSizes, size) }))}
                          style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1.5px solid', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: form.availableSizes.includes(size) ? '#111' : '#f5f5f5', color: form.availableSizes.includes(size) ? '#fff' : '#333', borderColor: form.availableSizes.includes(size) ? '#111' : '#ddd' }}>
                          {size}
                        </button>
                      ))}
                    </div>
                    <label className="checkbox-row"><input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange} /> Available</label>
                    <label className="checkbox-row"><input name="bestSeller" type="checkbox" checked={form.bestSeller} onChange={handleChange} /> Best Seller</label>
                    <div className="admin-form-buttons">
                      <button type="submit" className="btn-save" disabled={uploading}>{uploading ? 'Uploading...' : 'Save'}</button>
                      <button type="button" className="btn-cancel" onClick={() => { setSelectedProduct(null); setForm(EMPTY_FORM); setImageFile(null); }}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeAction === 'delete' && (
              <div className="admin-product-list">
                <div className="admin-list-header"><span>Product Name</span><span>Action</span></div>
                {products.map(p => (
                  <div key={p.productId} className="admin-product-row">
                    <span>{p.name}</span>
                    <button className="btn-delete" onClick={() => handleDelete(p.productId)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORY TAB ── */}
        {activeTab === 'category' && (
          <div className="admin-content">
            <h2 className="admin-section-title">Category</h2>
            <div className="admin-actions">
              <button className={activeCatAction === 'add' ? 'active' : ''} onClick={() => { setActiveCatAction('add'); setCatForm(EMPTY_CAT_FORM); setSelectedCategory(null); }}>Add</button>
              <button className={activeCatAction === 'edit' ? 'active' : ''} onClick={() => setActiveCatAction('edit')}>Edit</button>
              <button className={activeCatAction === 'delete' ? 'active' : ''} onClick={() => setActiveCatAction('delete')}>Delete</button>
            </div>
            {catMessage && <p className="admin-message">{catMessage}</p>}

            {activeCatAction === 'add' && (
              <form className="admin-form" onSubmit={handleCatAdd}>
                <label>Category Name</label>
                <input name="categoryName" value={catForm.categoryName} onChange={handleCatChange} required />
                <label>Image URL</label>
                <input name="imageUrl" value={catForm.imageUrl} onChange={handleCatChange} />
                <div className="admin-form-buttons">
                  <button type="submit" className="btn-save">Save</button>
                  <button type="button" className="btn-cancel" onClick={() => setCatForm(EMPTY_CAT_FORM)}>Cancel</button>
                </div>
              </form>
            )}

            {activeCatAction === 'edit' && (
              <div className="admin-edit-panel">
                {!selectedCategory && (
                  <div className="admin-product-list">
                    <div className="admin-list-header"><span>Category Name</span><span>Action</span></div>
                    {categories.map(c => (
                      <div key={c.categoryId} className="admin-product-row">
                        <span>{c.categoryName}</span>
                        <button onClick={() => handleSelectCatForEdit(c)}>Edit</button>
                      </div>
                    ))}
                  </div>
                )}
                {selectedCategory && (
                  <form className="admin-form" onSubmit={handleCatEdit}>
                    <p className="editing-label">Editing: <strong>{selectedCategory.categoryName}</strong></p>
                    <label>Category Name</label>
                    <input name="categoryName" value={catForm.categoryName} onChange={handleCatChange} required />
                    <label>Image URL</label>
                    <input name="imageUrl" value={catForm.imageUrl} onChange={handleCatChange} />
                    <div className="admin-form-buttons">
                      <button type="submit" className="btn-save">Save</button>
                      <button type="button" className="btn-cancel" onClick={() => { setSelectedCategory(null); setCatForm(EMPTY_CAT_FORM); }}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {activeCatAction === 'delete' && (
              <div className="admin-product-list">
                <div className="admin-list-header"><span>Category Name</span><span>Action</span></div>
                {categories.map(c => (
                  <div key={c.categoryId} className="admin-product-row">
                    <span>{c.categoryName}</span>
                    <button className="btn-delete" onClick={() => handleCatDelete(c.categoryId)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STOCK TAB ── */}
        {activeTab === 'stock' && (
          <div className="admin-content">
            <h2 className="admin-section-title">Stock</h2>
            {stockMessage && <p className="admin-message">{stockMessage}</p>}
            <div className="admin-stock-table">
              <div className="admin-stock-header">
                <span>Product</span><span>Stock</span><span></span>
              </div>
              {stockList.map(p => (
                <div key={p.productId} className="admin-stock-row">
                  <div>
                    <span className="admin-stock-name">{p.name}</span>
                    {p.stock <= 5 && p.stock > 0 && <span className="stock-warning">Low</span>}
                    {p.stock === 0 && <span className="stock-out">Out</span>}
                  </div>
                  <input type="number" min="0" value={stockEdits[p.productId] ?? p.stock} onChange={e => handleStockChange(p.productId, e.target.value)} className="stock-input" />
                  <button className="btn-save" onClick={() => handleStockSave(p.productId)}>Save</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="admin-content">
            <h2 className="admin-section-title">Users</h2>
            {userMessage && <p className="admin-message">{userMessage}</p>}
            <div className="admin-stock-table">
              <div className="admin-users-header">
                <span>Name</span><span>Email</span><span>Role</span><span></span>
              </div>
              {users.map(u => (
                <div key={u.customerId} className="admin-users-row">
                  <span className="admin-stock-name">{u.name || '—'}</span>
                  <span className="user-email">{u.email}</span>
                  <span className={u.role === 'ADMIN' ? 'role-badge role-admin' : 'role-badge role-user'}>{u.role}</span>
                  {u.email !== userDetails?.email ? (
                    <button className="btn-delete" onClick={() => handleDeleteUser(u.customerId)}>Delete</button>
                  ) : (
                    <span className="user-you-badge" style={{ minWidth: '60px', display: 'inline-block', textAlign: 'center' }}>You</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === 'orders' && (
          <div className="admin-content">
            <h2 className="admin-section-title">Orders</h2>
            {orderMessage && <p className="admin-message">{orderMessage}</p>}
            <div className="admin-orders-list">
              {orders.length === 0 && <p>No orders found.</p>}
              {orders.map(o => (
                <div key={o.id} className="admin-order-card">
                  <div className="order-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <h3>Order #{o.id}</h3>
                      <select
                        className={`modern-status-select status-${o.status.toLowerCase()}`}
                        value={o.status}
                        onChange={e => updateOrderStatus(o.id, e.target.value)}
                        style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="DELIVERING">Delivering</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                    <span className="order-date">{new Date(o.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-customer-row">
                      <p><strong>Customer:</strong> {o.customerName} ({o.customerEmail})</p>
                      <p><strong>Total:</strong> {o.currency} {(o.totalAmount / 100)?.toLocaleString()}</p>
                      {o.stripeSessionId && (
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                          <strong>Stripe Ref:</strong> {o.stripeSessionId}
                        </p>
                      )}
                    </div>

                    <div className="modern-order-table-container">
                      <table className="modern-order-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items?.map(item => {
                            const productImage = item.imageUrl || item.designImageUrl || 'https://via.placeholder.com/50';
                            const itemType = item.customOrderId ? 'Custom' : 'Standard';
                            const refId = item.customOrderId || item.productId || '—';
                            return (
                              <tr key={item.id}>
                                <td>
                                  <div className="modern-item-cell">
                                    <img src={productImage} alt={item.name} className="modern-item-img" />
                                    <div className="modern-item-info">
                                      <span className="modern-item-name">{item.name}</span>
                                      <span className="modern-item-sub">Ref ID: {refId}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>{itemType}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td>{o.currency} {(item.unitAmount / 100)?.toLocaleString()}</td>
                                <td>{o.currency} {(item.lineTotal / 100)?.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* ── DESIGN DOWNLOADS — all views ── */}
                    {o.items?.some(i => i.designImageUrl || i.allDesignImageUrls) && (
                      <div className="order-downloads" style={{ marginTop: '15px' }}>
                        <strong>Custom Design Downloads:</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                          {o.items
                            .filter(i => i.designImageUrl || i.allDesignImageUrls)
                            .map(item => {
                              const shots = item.allDesignImageUrls
                                ? JSON.parse(item.allDesignImageUrls)
                                : { Front: item.designImageUrl };
                              return Object.entries(shots).map(([view, url]) => (
                                <a key={`${item.id}-${view}`} href={url}
                                  target="_blank" rel="noreferrer"
                                  className="quick-action-btn">
                                  {item.name} – {view}
                                </a>
                              ));
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}