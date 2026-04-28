import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Filter,
  Search,
  X,
  Check,
  Truck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, productsRes, ordersRes, bannersRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/products'),
        axios.get('/api/orders'),
        axios.get('/api/banners')
      ]);

      setStats(statsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setBanners(bannersRes.data);
    } catch (error) {
      toast.error(t('error'));
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
      toast.success(t('success'));
      fetchDashboardData();
    } catch (error) {
      toast.error(t('error'));
      console.error('Error updating order status:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`/api/${type}/${id}`);
      toast.success(t('success'));
      fetchDashboardData();
    } catch (error) {
      toast.error(t('error'));
      console.error('Error deleting item:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.phone.includes(searchTerm);
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesDate = (!dateFilter.from || new Date(order.orderDate) >= new Date(dateFilter.from)) &&
                       (!dateFilter.to || new Date(order.orderDate) <= new Date(dateFilter.to));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return colors[status] || '';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: AlertCircle,
      confirmed: Check,
      processing: Package,
      shipped: Truck,
      delivered: Check,
      cancelled: X
    };
    return icons[status] || AlertCircle;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <h2 className="text-xl font-bold mb-8 text-green-400">Admin Panel</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              {t('dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'products' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'
              }`}
            >
              <Package className="inline w-4 h-4 mr-2" />
              {t('manageProducts')}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'orders' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'
              }`}
            >
              <ShoppingCart className="inline w-4 h-4 mr-2" />
              {t('manageOrders')}
            </button>
            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'banners' ? 'bg-green-600 text-white' : 'hover:bg-gray-700'
              }`}
            >
              <Image className="inline w-4 h-4 mr-2" />
              {t('manageBanners')}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('dashboard')}</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="admin-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{t('totalProducts')}</p>
                      <p className="text-2xl font-bold text-gray-800">{stats?.totalProducts || 0}</p>
                    </div>
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="admin-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{t('totalOrders')}</p>
                      <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders || 0}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="admin-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{t('pendingOrders')}</p>
                      <p className="text-2xl font-bold text-gray-800">{stats?.pendingOrders || 0}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                
                <div className="admin-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{t('totalRevenue')}</p>
                      <p className="text-2xl font-bold text-gray-800">৳{stats?.totalRevenue || 0}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="admin-card">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('recentOrders')}</h2>
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recentOrders?.map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-sm">#{order._id.slice(-6)}</td>
                          <td>{order.customer.name}</td>
                          <td>{order.customer.phone}</td>
                          <td>৳{order.totalAmount}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{t('manageProducts')}</h1>
                <button
                  onClick={() => {
                    setModalType('product');
                    setEditingItem(null);
                    setShowModal(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
              </div>
              
              <div className="admin-card">
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          </td>
                          <td>{product.name.en}</td>
                          <td>{product.category}</td>
                          <td>৳{product.price}</td>
                          <td>{product.stock} {product.unit.en}</td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-800">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete('products', product._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('manageOrders')}</h1>
              
              {/* Filters */}
              <div className="admin-card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by name or phone"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 input-field"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <input
                    type="date"
                    value={dateFilter.from}
                    onChange={(e) => setDateFilter({...dateFilter, from: e.target.value})}
                    className="input-field"
                  />
                  
                  <input
                    type="date"
                    value={dateFilter.to}
                    onChange={(e) => setDateFilter({...dateFilter, to: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="admin-card">
                <div className="overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-sm">#{order._id.slice(-6)}</td>
                          <td>{order.customer.name}</td>
                          <td>{order.customer.phone}</td>
                          <td>{order.items.length} items</td>
                          <td>৳{order.totalAmount}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800">
                                <Eye className="w-4 h-4" />
                              </button>
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                  className="text-sm border rounded px-2 py-1"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">{t('manageBanners')}</h1>
                <button
                  onClick={() => {
                    setModalType('banner');
                    setEditingItem(null);
                    setShowModal(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Banner</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                  <div key={banner._id} className="admin-card">
                    <img
                      src={banner.image}
                      alt={banner.title.en}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold text-gray-800 mb-2">{banner.title.en}</h3>
                    <p className="text-gray-600 text-sm mb-4">{banner.subtitle.en}</p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('banners', banner._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
