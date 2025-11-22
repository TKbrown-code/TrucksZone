# 🚚 TrucksZone - Truck Selling E-Commerce Platform

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.81.1-3ECF8E.svg)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.17-06B6D4.svg)](https://tailwindcss.com/)

A modern, full-stack truck selling e-commerce platform that connects truck buyers and sellers through an intuitive, feature-rich interface.

## 🌟 Features

### 🛒 **Customer Experience**
- **Advanced Truck Browsing**: Filter by category, price, mileage, and more
- **Detailed Listings**: High-quality images, videos, and comprehensive specifications
- **Real-time Chat**: Instant communication with sellers
- **User Dashboard**: Manage saved trucks, inquiries, and profile
- **Mobile Responsive**: Optimized experience across all devices

### 🛠️ **Admin Dashboard**
- **Complete Truck Management**: Add, edit, and manage truck inventory
- **User Management**: Oversee user accounts and permissions
- **Real-time Analytics**: Track sales, views, and user engagement
- **Media Management**: Upload and organize truck photos/videos
- **Chat Support**: Respond to customer inquiries in real-time

### 🔧 **Technical Features**
- **Modern Tech Stack**: React 19, Vite, Supabase, TailwindCSS
- **Real-time Database**: Live updates and notifications
- **Secure Authentication**: Role-based access control
- **Progressive Web App**: Fast, reliable, and installable
- **SEO Optimized**: Built for search engine visibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/truckszone.git
   cd truckszone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create the required database tables (see Database Setup below)

4. **Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🗄️ Database Setup

### Required Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trucks table
CREATE TABLE trucks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  mileage INTEGER,
  year INTEGER,
  make VARCHAR(100),
  model VARCHAR(100),
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'available',
  seller_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Truck images table
CREATE TABLE truck_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Truck videos table
CREATE TABLE truck_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
  video_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE truck_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table for chat
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  truck_id UUID REFERENCES trucks(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can view trucks
CREATE POLICY "Trucks are viewable by everyone" ON trucks
  FOR SELECT USING (true);

-- Only authenticated users can send messages
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));
```

## 🏗️ Project Structure

```
truckszone/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Landing/         # Landing page components
│   │   ├── forms/           # Authentication forms
│   │   ├── guards/          # Route protection
│   │   └── userDashboard/   # User dashboard components
│   ├── pages/               # Main application pages
│   ├── admin/               # Admin dashboard (24 files)
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── styles/              # CSS files
│   ├── utils/               # Utility functions
│   └── assets/              # Static assets
├── public/                  # Public assets
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🎨 Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **Vite 7.2.2** - Build tool and dev server
- **React Router DOM 7.9.6** - Client-side routing
- **TailwindCSS 4.1.17** - Utility-first CSS framework
- **AOS 2.3.4** - Animate on scroll library
- **Framer Motion 12.23.24** - Animation library

### Backend & Database
- **Supabase 2.81.1** - Backend as a Service
  - PostgreSQL database
  - Authentication system
  - Real-time subscriptions
  - Edge functions
  - File storage

### UI & Icons
- **Lucide React 0.554.0** - Icon library
- **FontAwesome 7.1.0** - Premium icons
- **React Icons 5.5.0** - Additional icon sets

### Notifications & UI
- **React Toastify 11.0.5** - Toast notifications
- **SweetAlert2 11.26.3** - Beautiful alerts
- **Radix UI 1.1.15** - Accessible components

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px - 1024px
- **Large Desktop**: 1025px+

### Features
- Touch-friendly interface
- Swipe gestures for carousels
- Adaptive layouts
- Optimized images per device
- Mobile-first navigation

## 🔐 Authentication & Security

### User Roles
- **User**: Can browse trucks, chat, manage profile
- **Admin**: Full dashboard access, truck management

### Security Features
- JWT token-based authentication
- Row Level Security (RLS)
- Input validation and sanitization
- XSS protection
- Secure file uploads
- Rate limiting

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Deployment Platforms
- **Netlify**: Drag and drop build folder
- **Vercel**: Connect GitHub repository
- **AWS S3**: Static site hosting
- **Firebase Hosting**: Google's hosting solution

## 🧪 Testing

### Linting
```bash
npm run lint
```

### Type Checking (if using TypeScript)
```bash
npm run type-check
```

### Building for Production
```bash
npm run build
npm run preview
```

## 📊 Performance

### Core Web Vitals
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Optimization Features
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- Service worker ready

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style
- ESLint configuration
- Prettier formatting
- Component-based architecture
- Custom hooks for logic
- Context for state management

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure mobile responsiveness

## 📝 API Reference

### Supabase Client
```javascript
import { supabase } from './lib/supabase'

// Fetch trucks
const { data: trucks } = await supabase
  .from('trucks')
  .select('*')
  .eq('status', 'available')

// Real-time subscription
const subscription = supabase
  .from('messages')
  .on('INSERT', payload => {
    console.log('New message!', payload)
  })
  .subscribe()
```

### Edge Functions
```javascript
// Upload truck data
const { data, error } = await supabase.functions.invoke('upload-truck', {
  body: { truckData }
})
```

## 🐛 Troubleshooting

### Common Issues

**Q: Supabase connection failed**
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

**Q: Build failed**
```bash
# Clear cache
npm run build -- --force
```

**Q: Images not loading**
- Check Supabase storage permissions
- Verify image URLs
- Check CORS policies

### Getting Help
- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/your-username/truckszone/issues)
- 💬 [Discord Community](https://discord.gg/your-server)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Backend as a Service
- [React](https://reactjs.org/) - UI framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool
- All contributors and users

## 📞 Contact

- **Website**: [truckszone.com](https://truckszone.com)
- **Email**: support@truckszone.com
- **Phone**: 1-800-TRUCKS
- **Address**: 1234 Highway Boulevard, Dallas, TX 75001

---

<div align="center">
  <p>Made with ❤️ by the TrucksZone Team</p>
  <p>© 2025 TrucksZone. All rights reserved.</p>
</div>
