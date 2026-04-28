import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400">KrishiServiceBD</h3>
                <p className="text-sm text-gray-400 font-bengali">কৃষকের জন্য সম্পূর্ণ সেবা</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              {t('tagline')}
            </p>
            <p className="text-sm text-gray-400">
              {t('copyright')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-green-400 transition-colors">
                  {t('home')}
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-green-400 transition-colors">
                  {t('products')}
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-green-400 transition-colors">
                  {t('about')}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-green-400 transition-colors">
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-green-400">{t('contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">+880 1234 567890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">info@krishiservicebd.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-3 mt-6">
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
