# KrishiServiceBD - Agricultural E-commerce Platform

A comprehensive agricultural e-commerce website for Bangladesh, supporting both Bengali and English languages. The platform allows farmers to purchase fertilizers, seeds, pesticides, and get consultation services.

## Features

### Customer Features
- **Bilingual Support**: Full Bengali and English language support
- **Product Catalog**: Browse agricultural products by category
- **Product Details**: Detailed product information with images and pricing
- **Order Management**: Simple order placement with customer information
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Dashboard**: Overview of products, orders, and revenue
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and process orders with status tracking
- **Banner Management**: Edit homepage banners
- **Date Filtering**: Filter orders by date range

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Hook Form**: Form management
- **React Hot Toast**: Notification system

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Multer**: File upload handling
- **JWT**: Authentication (ready for implementation)

## Project Structure

```
krishiservicebd/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS files
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── uploads/            # File upload directory
│   ├── .env                # Environment variables
│   └── index.js            # Server entry point
├── package.json            # Root package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed and running)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd krishiservicebd
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   - Copy `server/.env` and update with your MongoDB connection string
   - Update JWT secret and other configurations as needed

5. **Start MongoDB** (if not running)
   ```bash
   # For Windows
   net start MongoDB
   
   # For macOS/Linux
   sudo systemctl start mongod
   ```

6. **Run the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   npm run server  # Starts backend on port 5000
   npm run client  # Starts frontend on port 3000
   ```

## Usage

### Customer Flow
1. Visit the homepage to view featured products and banners
2. Browse products by category (Fertilizer, Seed, Pesticide, Consultation)
3. Click on a product to view detailed information
4. Click "Order" to proceed with purchase
5. Fill in customer information (name, phone, address)
6. Submit order - it will appear in the admin dashboard

### Admin Flow
1. Navigate to `/admin` to access the dashboard
2. View statistics: total products, orders, revenue
3. Manage products: add new products, edit existing ones
4. Process orders: update order status, filter by date
5. Manage banners: edit homepage banners

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status (admin)
- `DELETE /api/orders/:id` - Delete order (admin)

### Banners
- `GET /api/banners` - Get all banners
- `GET /api/banners/:id` - Get single banner
- `POST /api/banners` - Create banner (admin)
- `PUT /api/banners/:id` - Update banner (admin)
- `DELETE /api/banners/:id` - Delete banner (admin)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/orders/daily` - Get daily order statistics

## Database Schema

### Product
```javascript
{
  name: { en: String, bn: String },
  description: { en: String, bn: String },
  category: ['fertilizer', 'seed', 'pesticide', 'consultation'],
  price: Number,
  image: String,
  stock: Number,
  unit: { en: String, bn: String },
  isActive: Boolean
}
```

### Order
```javascript
{
  customer: {
    name: String,
    phone: String,
    address: String
  },
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  orderDate: Date
}
```

### Banner
```javascript
{
  title: { en: String, bn: String },
  subtitle: { en: String, bn: String },
  image: String,
  isActive: Boolean,
  order: Number
}
```

## Deployment

### Production Build
1. Build the React app:
   ```bash
   cd client
   npm run build
   cd ..
   ```

2. Set environment variables:
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: JWT secret key
- `UPLOAD_DIR`: File upload directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and inquiries, contact:
- Email: info@krishiservicebd.com
- Phone: +880 1234 567890

## Future Enhancements

- User authentication and authorization
- Payment gateway integration
- SMS notifications for order updates
- Advanced product search and filtering
- Customer reviews and ratings
- Inventory management system
- Multi-vendor support
- Mobile app development
