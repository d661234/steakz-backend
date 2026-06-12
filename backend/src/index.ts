import express, { Request, Response, NextFunction } from 'express'; // Import Express and its TypeScript types for request/response/middleware
import cors from 'cors'; // Import CORS middleware to allow cross-origin requests from the frontend
import bcrypt from 'bcryptjs'; // Import bcrypt for hashing the admin password on startup
import { PrismaClient, UserRole } from '@prisma/client'; // Import Prisma database client and UserRole enum
import authRoutes from './routes/authRoutes.js'; // Import routes handling login and registration
import adminRoutes from './routes/adminRoutes.js'; // Import routes for admin user management
import branchRoutes from './routes/branchRoutes.js'; // Import routes for branch and menu management
import orderRoutes from './routes/orderRoutes.js'; // Import routes for order creation and status updates
import hqRoutes from './routes/hqRoutes.js'; // Import routes for HQ analytics and staff management
import customerRoutes from './routes/customerRoutes.js'; // Import routes for customer profile, favourites, and recommendations
import stockRoutes from './routes/stockRoutes.js'; // Import routes for stock/restock request management

const prisma = new PrismaClient(); // Create a Prisma client instance for direct database access in this file

async function ensureAdmin() { // Guarantees an admin account always exists when the server starts
  const hash = await bcrypt.hash('password123', 10); // Hash the default admin password with 10 salt rounds
  await prisma.user.upsert({ // Insert admin if missing, or update their password/role if they already exist
    where:  { email: 'admin@steakz.com' }, // Look up by email as the unique identifier
    update: { password_hash: hash, role: UserRole.ADMIN }, // Refresh password and confirm ADMIN role on each start
    create: { email: 'admin@steakz.com', password_hash: hash, role: UserRole.ADMIN, firstName: 'Admin', lastName: 'User' }, // Create full admin record if not found
  });
  console.log('✅ Admin user ready  →  admin@steakz.com / password123');
  console.log('🚀 Steakz API v2 — CHEF role enabled');
}

const app = express(); // Create the Express application instance
const PORT = process.env.PORT || 3000; // Use the PORT env variable if set, otherwise default to 3000

// Middleware
const allowedOrigins = [ // Whitelist of origins permitted to make cross-origin requests
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // same-origin / server-to-server
    const isAllowed =
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin);   // accept any *.vercel.app preview/production URL
    if (isAllowed) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json()); // Parse incoming JSON request bodies and make them available on req.body

// Routes
app.use('/api/auth', authRoutes); // Mount authentication routes at /api/auth (login, register)
app.use('/api/admin', adminRoutes); // Mount admin-only user management routes at /api/admin
app.use('/api/branches', branchRoutes); // Mount branch and menu management routes at /api/branches
app.use('/api/orders', orderRoutes); // Mount order management routes at /api/orders
app.use('/api/hq', hqRoutes); // Mount HQ analytics and staff routes at /api/hq
app.use('/api/customer', customerRoutes); // Mount customer-specific routes at /api/customer
app.use('/api/stock', stockRoutes); // Mount stock request routes at /api/stock

// Health check
app.get('/health', (req: Request, res: Response) => { // Simple endpoint for load balancers and uptime monitors
  res.status(200).json({ status: 'UP' }); // Respond with 200 and status UP to confirm the server is running
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => { // Global error handler — must have 4 params to be recognised by Express as error middleware
  console.error(err.stack); // Log the full stack trace to the server console for debugging
  res.status(500).json({ // Always return 500 for unhandled errors reaching this handler
    message: 'An unexpected error occurred', // Generic message safe to expose to clients
    error: process.env.NODE_ENV === 'development' ? err.message : undefined, // Only include the raw error message in development to avoid leaking internals
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') { // Skip server startup during test runs so tests can import app without binding a port
  ensureAdmin().then(() => { // Ensure the admin account exists before accepting connections
    app.listen(PORT, () => { // Bind the server to the configured port
      console.log(`Server is running on port ${PORT}`); // Confirm the port the server is listening on
    });
  });
}

export default app; // Export the Express app so it can be imported by tests and other modules
