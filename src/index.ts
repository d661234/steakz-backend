import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import hqRoutes from './routes/hqRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import stockRoutes from './routes/stockRoutes.js';

const prisma = new PrismaClient();

async function ensureAdmin() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@steakz.com' },
    update: { password_hash: hash, role: UserRole.ADMIN },
    create: { email: 'admin@steakz.com', password_hash: hash, role: UserRole.ADMIN, firstName: 'Admin', lastName: 'User' },
  });
  console.log('✅ Admin user ready  →  admin@steakz.com / password123');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hq', hqRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/stock', stockRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  ensureAdmin().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  });
}

export default app;
