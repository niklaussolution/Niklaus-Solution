import express from 'express';
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
} from '../controllers/certificateController';

const router = express.Router();

// Public route - Verify certificate (for PDF generation)
router.post('/verify', verifyCertificate);

// Admin routes
router.get('/', getAllCertificates);
router.get('/:id', getCertificateById);
router.post('/', createCertificate);
router.put('/:id', updateCertificate);
router.delete('/:id', deleteCertificate);

export default router;
