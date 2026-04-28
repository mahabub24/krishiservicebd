import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, ShoppingCart, Menu, X } from 'lucide-react';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const categories = [
    { key: 'fertilizer', path: '/products?category=fertilizer' },
    { key: 'seed', path: '/products?category=seed' },
    { key: 'pesticide', path: '/products?category=pesticide' },
    { key: 'consultation', path: '/products?category=consultation' }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-600">KrishiServiceBD</h1>
              <p className="text-xs text-gray-600 font-bengali">কৃষকের জন্য সম্পূর্ণ সেবা</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              {t('home')}
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-green-600 transition-colors">
                {t('products')}
              </button>
              <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {categories.map((category) => (
                  <Link
                    key={category.key}
                    to={category.path}
                    className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                  >
                    {t(category.key)}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/admin" className="text-gray-700 hover:text-green-600 transition-colors">
              {t('admin')}
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === 'en' ? 'BN' : 'EN'}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-green-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('home')}
              </Link>
              <div className="px-4 py-2">
                <p className="text-gray-700 font-medium mb-2">{t('products')}</p>
                <div className="pl-4 space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.key}
                      to={category.path}
                      className="block py-1 text-gray-600 hover:text-green-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t(category.key)}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/admin"
                className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('admin')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
