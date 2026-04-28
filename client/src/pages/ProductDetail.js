import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id, language]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}?language=${language}`);
      setProduct(response.data);
    } catch (error) {
      toast.error(t('error'));
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      fertilizer: '🌾',
      seed: '🌱',
      pesticide: '🛡️',
      consultation: '💡'
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <Link to="/" className="btn-primary">
            {t('home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link to="/" className="hover:text-green-600">
          {t('home')}
        </Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-green-600">
          {t(product.category)}
        </Link>
        <span>/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCategoryIcon(product.category)}</span>
            <span className="text-sm font-medium text-gray-600">
              {t(product.category)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">(4.0/5.0)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-green-600">
              ৳{product.price}
            </span>
            <span className="text-gray-600">/ {product.unit}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">
              {t('stock')}:
            </span>
            <span className={`text-sm font-medium ${
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Out of stock'}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('description')}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Quantity:
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-600">
              Total: ৳{product.price * quantity}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Link
              to={`/order/${product._id}`}
              state={{ quantity }}
              className="btn-primary flex-1 text-center flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t('confirmOrder')}</span>
            </Link>
            <button className="btn-outline flex-1">
              {t('addToCart')}
            </button>
          </div>

          {/* Features */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Key Features
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-600">High quality agricultural product</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-600">Suitable for Bangladeshi climate</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-600">Expert recommended</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-600">Fast delivery available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
