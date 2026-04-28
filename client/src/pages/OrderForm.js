import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ShoppingBag, Phone, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const OrderForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  useEffect(() => {
    fetchProduct();
    
    // Get quantity from navigation state if available
    const state = window.history?.state?.usr;
    if (state?.quantity) {
      setQuantity(state.quantity);
      setValue('quantity', state.quantity);
    }
  }, [productId, language, setValue]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${productId}?language=${language}`);
      setProduct(response.data);
      setValue('quantity', quantity);
    } catch (error) {
      toast.error(t('error'));
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      const orderData = {
        customer: {
          name: data.name,
          phone: data.phone,
          address: data.address
        },
        items: [{
          product: productId,
          quantity: parseInt(data.quantity),
          price: product.price
        }],
        notes: data.notes
      };

      const response = await axios.post('/api/orders', orderData);
      
      toast.success(t('orderSuccess'));
      
      // Redirect to admin dashboard or success page
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
      
    } catch (error) {
      toast.error(t('orderFailed'));
      console.error('Error submitting order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
      setValue('quantity', newQuantity);
    }
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
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to={`/product/${productId}`}
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('productDetails')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Summary */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('productDetails')}
            </h2>
            
            <div className="flex space-x-4 mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-green-600">
                    ৳{product.price}
                  </span>
                  <span className="text-gray-600">/ {product.unit}</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium text-gray-600">
                Quantity:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">৳{product.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity} {product.unit}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">৳{product.price * quantity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t('customerInfo')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  {t('name')} *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="input-field"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^01[3-9]\d{8}$/,
                      message: 'Please enter a valid Bangladeshi phone number'
                    }
                  })}
                  className="input-field"
                  placeholder="01XXXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t('address')} *
                </label>
                <textarea
                  {...register('address', { required: 'Address is required' })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter your complete address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              {/* Hidden quantity field */}
              <input type="hidden" {...register('quantity')} />

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  className="input-field"
                  rows={3}
                  placeholder="Any special instructions or notes"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{submitting ? 'Processing...' : t('submitOrder')}</span>
              </button>
            </form>
          </div>

          {/* Delivery Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Delivery Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Free delivery for orders above ৳1000</li>
              <li>• Delivery within 2-3 business days</li>
              <li>• Cash on delivery available</li>
              <li>• 24/7 customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
