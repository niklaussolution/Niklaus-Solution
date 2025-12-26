import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { initializeFirebase } from '../config/database.js';

// Import routes
import authRoutes from '../routes/auth.js';
import contentRoutes from '../routes/content.js';
import videoRoutes from '../routes/videos.js';
import userRoutes from '../routes/users.js';
import settingsRoutes from '../routes/settings.js';
import workshopRoutes from '../routes/workshops.js';
import pricingPlanRoutes from '../routes/pricingPlans.js';
import registrationRoutes from '../routes/registrations.js';
import trainerRoutes from '../routes/trainers.js';
import testimonialRoutes from '../routes/testimonials.js';
import featureRoutes from '../routes/features.js';
import scholarshipRoutes from '../routes/scholarships.js';
import companyRoutes from '../routes/companies.js';
import faqRoutes from '../routes/faqs.js';
import paymentRoutes from '../routes/payments.js';
import certificateRoutes from '../routes/certificates.js';

const workspaceEnvPath = path.resolve(__dirname, '..', '..', '.env');
const backendEnvPath = path.resolve(__dirname, '..', '.env');
const envPath = fs.existsSync(workspaceEnvPath) ? workspaceEnvPath : backendEnvPath;
dotenv.config({ path: envPath });

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase
initializeFirebase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/pricing-plans', pricingPlanRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', database: 'Firebase' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
