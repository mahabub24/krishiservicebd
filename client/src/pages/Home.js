import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Home = () => {
  const { t, language } = useLanguage();
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [language]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, productsRes] = await Promise.all([
        axios.get(`/api/banners?language=${language}`),
        axios.get(`/api/products?language=${language}`)
      ]);

      setBanners(bannersRes.data);
      setProducts(productsRes.data);
      
      // Get unique categories
      const uniqueCategories = [...new Set(productsRes.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error(t('error'));
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const getCategoryProducts = (category) => {
    return products.filter(product => product.category === category).slice(0, 4);
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

  return (
    <div className="space-y-8">
      {/* Banner Section */}
      {banners.length > 0 && (
        <section className="relative">
          <div className="banner-slide" style={{ backgroundImage: `url(${banners[currentBanner]?.image})` }}>
            <div className="banner-overlay">
              <div className="banner-content">
                <h2 className="banner-title">{banners[currentBanner]?.title}</h2>
                <p className="banner-subtitle">{banners[currentBanner]?.subtitle}</p>
              </div>
            </div>
          </div>
          
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentBanner ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {t('products')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/products?category=${category}`}
              className="category-card text-center"
            >
              <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
              <h3 className="font-semibold text-gray-800">{t(category)}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Products by Category */}
      {categories.map((category) => {
        const categoryProducts = getCategoryProducts(category);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {t(category)}
              </h2>
              <Link
                to={`/products?category=${category}`}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image" style={{ backgroundImage: `url(${product.image})` }} />
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="product-price">
                      ৳{product.price} / {product.unit}
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/product/${product._id}`}
                        className="btn-outline flex-1 text-center"
                      >
                        {t('productDetails')}
                      </Link>
                      <Link
                        to={`/order/${product._id}`}
                        className="btn-primary flex-1 text-center"
                      >
                        {t('order')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Home;
