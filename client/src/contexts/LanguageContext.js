import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    about: 'About',
    contact: 'Contact',
    admin: 'Admin',
    
    // Categories
    fertilizer: 'Fertilizer',
    seed: 'Seed',
    pesticide: 'Pesticide',
    consultation: 'Consultation Service',
    
    // Product
    price: 'Price',
    order: 'Order',
    confirmOrder: 'Confirm Order',
    productDetails: 'Product Details',
    description: 'Description',
    category: 'Category',
    stock: 'Stock',
    addToCart: 'Add to Cart',
    
    // Order Form
    customerInfo: 'Customer Information',
    name: 'Name',
    phone: 'Phone Number',
    address: 'Address',
    submitOrder: 'Submit Order',
    orderSuccess: 'Order submitted successfully!',
    orderFailed: 'Failed to submit order',
    
    // Admin
    dashboard: 'Dashboard',
    manageProducts: 'Manage Products',
    manageOrders: 'Manage Orders',
    manageBanners: 'Manage Banners',
    totalProducts: 'Total Products',
    totalOrders: 'Total Orders',
    pendingOrders: 'Pending Orders',
    totalRevenue: 'Total Revenue',
    recentOrders: 'Recent Orders',
    
    // General
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    filter: 'Filter',
    
    // Footer
    company: 'KrishiServiceBD',
    tagline: 'Complete service for farmers',
    copyright: '© 2024 KrishiServiceBD. All rights reserved.',
    
    // Contact
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    addressLabel: 'Address'
  },
  bn: {
    // Navigation
    home: 'হোম',
    products: 'পণ্য',
    about: 'আমাদের সম্পর্কে',
    contact: 'যোগাযোগ',
    admin: 'অ্যাডমিন',
    
    // Categories
    fertilizer: 'সার',
    seed: 'বীজ',
    pesticide: 'কীটনাশক',
    consultation: 'পরামর্শ সেবা',
    
    // Product
    price: 'মূল্য',
    order: 'অর্ডার',
    confirmOrder: 'অর্ডার নিশ্চিত করুন',
    productDetails: 'পণ্যের বিস্তারিত',
    description: 'বর্ণনা',
    category: 'বিভাগ',
    stock: 'স্টক',
    addToCart: 'কার্টে যোগ করুন',
    
    // Order Form
    customerInfo: 'গ্রাহকের তথ্য',
    name: 'নাম',
    phone: 'ফোন নম্বর',
    address: 'ঠিকানা',
    submitOrder: 'অর্ডার জমা দিন',
    orderSuccess: 'অর্ডার সফলভাবে জমা হয়েছে!',
    orderFailed: 'অর্ডার জমা দিতে ব্যর্থ হয়েছে',
    
    // Admin
    dashboard: 'ড্যাশবোর্ড',
    manageProducts: 'পণ্য ব্যবস্থাপনা',
    manageOrders: 'অর্ডার ব্যবস্থাপনা',
    manageBanners: 'ব্যানার ব্যবস্থাপনা',
    totalProducts: 'মোট পণ্য',
    totalOrders: 'মোট অর্ডার',
    pendingOrders: 'অপেক্ষমান অর্ডার',
    totalRevenue: 'মোট আয়',
    recentOrders: 'সাম্প্রতিক অর্ডার',
    
    // General
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    edit: 'সম্পাদনা',
    delete: 'মুছুন',
    search: 'অনুসন্ধান',
    filter: 'ফিল্টার',
    
    // Footer
    company: 'কৃষিসেবাবিডি',
    tagline: 'কৃষকের জন্য সম্পূর্ণ সেবা',
    copyright: '© ২০২৪ কৃষিসেবাবিডি। সর্বস্বত্ব সংরক্ষিত।',
    
    // Contact
    phoneLabel: 'ফোন',
    emailLabel: 'ইমেল',
    addressLabel: 'ঠিকানা'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
