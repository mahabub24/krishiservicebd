import { Router } from 'express';
import { authenticate, authorize, optionalAuth, requirePermission, requireStaff } from '../middleware/auth';
import { authLimiter, orderLimiter, sensitiveLimiter } from '../middleware/security';
import { validateRequest as v } from '../middleware/validate';
import * as S from '../validators';
import * as auth from '../controllers/authController';
import * as catalog from '../controllers/catalogController';
import * as customer from '../controllers/customerController';
import * as adminCat from '../controllers/adminCatalogController';
import * as ops from '../controllers/adminOpsController';
import * as content from '../controllers/contentController';

const api = Router();

// ---------- /auth ----------
const authR = Router();
authR.post('/register', authLimiter, v(S.registerSchema), auth.register);
authR.post('/login', authLimiter, v(S.loginSchema), auth.login);
authR.post('/logout', auth.logout);
authR.get('/me', authenticate, auth.getMe);
authR.post('/forgot-password', sensitiveLimiter, v(S.forgotPasswordSchema), auth.forgotPassword);
authR.post('/reset-password', sensitiveLimiter, v(S.resetPasswordSchema), auth.resetPassword);
authR.post('/change-password', authenticate, authLimiter, v(S.changePasswordSchema), auth.changePassword);
api.use('/auth', authR);

// ---------- /products, /categories, /brands ----------
const products = Router();
products.get('/', v(S.productListSchema), catalog.getProducts);
products.get('/featured', catalog.getFeaturedProducts);
products.get('/by-ids', catalog.getProductsByIds);
products.get('/:slug', v(S.slugParams), catalog.getProductBySlug);
api.use('/products', products);

const categories = Router();
categories.get('/', catalog.getCategories);
categories.get('/:slug', v(S.slugParams), catalog.getCategoryBySlug);
api.use('/categories', categories);
api.get('/brands', catalog.getBrands);

// ---------- /cart ----------
const cart = Router();
cart.post('/quote', v(S.cartQuoteSchema), catalog.quoteCart); // public: authoritative server pricing
cart.get('/', authenticate, customer.getCart);
cart.put('/', authenticate, v(S.cartSyncSchema), customer.syncCart);
api.use('/cart', cart);

// ---------- /orders ----------
const orders = Router();
orders.post('/', orderLimiter, optionalAuth, v(S.checkoutSchema), customer.createOrder);
orders.get('/my-orders', authenticate, customer.getMyOrders);
orders.post('/:orderNumber/cancel', authenticate, customer.cancelMyOrder);
orders.get('/:orderNumber', optionalAuth, v(S.orderLookupSchema), customer.getOrderByNumber);
api.use('/orders', orders);

// ---------- /customers (own account) ----------
const customers = Router();
customers.use(authenticate);
customers.patch('/me', v(S.profileUpdateSchema), auth.updateProfile);
customers.get('/me/addresses', customer.listAddresses);
customers.post('/me/addresses', v(S.addressSchema), customer.createAddress);
customers.patch('/me/addresses/:id', v(S.addressUpdateSchema), customer.updateAddress);
customers.delete('/me/addresses/:id', v(S.idParams), customer.deleteAddress);
api.use('/customers', customers);

// ---------- public content ----------
api.get('/settings', content.publicSettings);
api.get('/banners', content.publicBanners);
const articles = Router();
articles.get('/', content.publicArticles);
articles.get('/:slug', v(S.slugParams), content.publicArticle);
api.use('/articles', articles);
api.post('/newsletter/subscribe', sensitiveLimiter, v(S.newsletterSchema), content.subscribeNewsletter);

// ---------- /admin (staff+; per-module permission) ----------
const admin = Router();
admin.use(authenticate, requireStaff);
admin.get('/dashboard', ops.dashboard);

admin.post('/uploads', content.upload.array('images', 5), content.uploadImages);

const P = requirePermission;
admin.get('/products', P('products'), v(S.adminProductListSchema), adminCat.listProducts);
admin.get('/products/export.csv', P('products'), adminCat.exportProductsCsv);
admin.post('/products/import', P('products'), v(S.csvImportSchema), adminCat.importProductsCsv);
admin.get('/products/:id', P('products'), v(S.idParams), adminCat.getProduct);
admin.post('/products', P('products'), v(S.productCreateSchema), adminCat.createProduct);
admin.patch('/products/:id', P('products'), v(S.productUpdateSchema), adminCat.updateProduct);
admin.delete('/products/:id', P('products'), v(S.idParams), adminCat.deleteProduct);

admin.get('/categories', P('categories'), adminCat.listCategories);
admin.post('/categories', P('categories'), v(S.categorySchema), adminCat.createCategory);
admin.patch('/categories/reorder', P('categories'), v(S.categoryReorderSchema), adminCat.reorderCategories);
admin.patch('/categories/:id', P('categories'), v(S.categoryUpdateSchema), adminCat.updateCategory);
admin.delete('/categories/:id', P('categories'), v(S.idParams), adminCat.deleteCategory);
admin.post('/brands', P('products'), v(S.brandSchema), adminCat.createBrand);
admin.patch('/brands/:id', P('products'), v(S.idParams), v(S.brandSchema), adminCat.updateBrand);
admin.delete('/brands/:id', P('products'), v(S.idParams), adminCat.deleteBrand);

admin.get('/orders', P('orders'), v(S.adminOrderListSchema), ops.listOrders);
admin.get('/orders/:id', P('orders'), v(S.idParams), ops.getOrder);
admin.patch('/orders/:id', P('orders'), v(S.orderUpdateSchema), ops.updateOrder);

admin.get('/customers', P('customers'), v(S.customerListSchema), ops.listCustomers);
admin.get('/customers/:id', P('customers'), v(S.idParams), ops.getCustomer);
admin.patch('/customers/:id/status', P('customers'), v(S.customerStatusSchema), ops.setCustomerStatus);

admin.get('/inventory/low-stock', P('inventory'), ops.lowStock);
admin.get('/inventory/movements', P('inventory'), ops.stockMovements);
admin.post('/inventory/adjust', P('inventory'), v(S.stockAdjustSchema), ops.adjustStock);

admin.get('/banners', P('content'), content.adminBanners);
admin.post('/banners', P('content'), v(S.bannerSchema), content.createBanner);
admin.patch('/banners/:id', P('content'), v(S.idParams), v(S.bannerSchema), content.updateBanner);
admin.delete('/banners/:id', P('content'), v(S.idParams), content.deleteBanner);
admin.get('/articles', P('content'), content.adminArticles);
admin.post('/articles', P('content'), v(S.articleSchema), content.createArticle);
admin.patch('/articles/:id', P('content'), v(S.idParams), v(S.articleSchema), content.updateArticle);
admin.delete('/articles/:id', P('content'), v(S.idParams), content.deleteArticle);
admin.get('/settings', P('content'), content.adminGetSettings);
admin.put('/settings', P('content'), v(S.settingsSchema), content.adminUpdateSettings);
admin.get('/coupons', P('orders'), content.listCoupons);
admin.post('/coupons', P('orders'), v(S.couponSchema), content.createCoupon);
admin.delete('/coupons/:id', P('orders'), v(S.idParams), content.deleteCoupon);

// staff management: super admin only
admin.get('/staff', authorize('SUPER_ADMIN'), ops.listStaff);
admin.post('/staff', authorize('SUPER_ADMIN'), v(S.staffSchema), ops.createStaff);
admin.patch('/staff/:id', authorize('SUPER_ADMIN'), v(S.staffUpdateSchema), ops.updateStaff);
api.use('/admin', admin);

// ---------- /reports ----------
const reports = Router();
reports.use(authenticate, requireStaff, P('reports'));
reports.get('/sales', v(S.salesReportSchema), ops.salesReport);
reports.get('/order-status', v(S.reportFormatSchema), ops.orderStatusReport);
reports.get('/best-sellers', v(S.reportFormatSchema), ops.bestSellersReport);
api.use('/reports', reports);

export default api;
