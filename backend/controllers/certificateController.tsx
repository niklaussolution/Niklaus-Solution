import { Request, Response } from 'express';
import { getDatabase } from '../config/database.js';
import { ICertificate, CERTIFICATES_COLLECTION } from '../models/Certificate.js';
import crypto from 'crypto';

const db = getDatabase();

// Generate unique certificate ID
const generateCertificateId = () => {
  return 'CERT-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const getAllCertificates = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let baseQuery: any = db.collection(CERTIFICATES_COLLECTION);

    if (status) {
      baseQuery = baseQuery.where('status', '==', status);
    }

    let snapshot = await baseQuery.orderBy('createdAt', 'desc').get();
    let certificates = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (search) {
      const searchLower = (search as string).toLowerCase();
      certificates = certificates.filter(
        (cert: any) =>
          cert.studentName.toLowerCase().includes(searchLower) ||
          cert.certificateId.toLowerCase().includes(searchLower) ||
          cert.studentEmail.toLowerCase().includes(searchLower)
      );
    }

    res.json(certificates);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection(CERTIFICATES_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching certificate', error: error.message });
  }
};

export const createCertificate = async (req: Request, res: Response) => {
  try {
    const {
      studentName,
      studentEmail,
      courseName,
      completionDate,
      instructorName,
      courseCode,
      notes,
    } = req.body;

    // Validate required fields
    if (!studentName || !studentEmail || !courseName || !completionDate) {
      return res.status(400).json({
        message: 'Missing required fields: studentName, studentEmail, courseName, completionDate',
      });
    }

    const certificateId = generateCertificateId();

    const newCertificate: ICertificate = {
      studentName,
      studentEmail,
      courseName,
      certificateId,
      completionDate,
      issueDate: new Date().toISOString(),
      instructorName,
      courseCode,
      status: 'issued',
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(CERTIFICATES_COLLECTION).add(newCertificate);

    res.status(201).json({
      id: docRef.id,
      ...newCertificate,
      message: 'Certificate created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating certificate', error: error.message });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      studentName,
      studentEmail,
      courseName,
      completionDate,
      instructorName,
      courseCode,
      status,
      notes,
    } = req.body;

    const doc = await db.collection(CERTIFICATES_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const updateData: Partial<ICertificate> = {
      updatedAt: Date.now(),
    };

    if (studentName) updateData.studentName = studentName;
    if (studentEmail) updateData.studentEmail = studentEmail;
    if (courseName) updateData.courseName = courseName;
    if (completionDate) updateData.completionDate = completionDate;
    if (instructorName) updateData.instructorName = instructorName;
    if (courseCode) updateData.courseCode = courseCode;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await db.collection(CERTIFICATES_COLLECTION).doc(id).update(updateData);

    res.json({
      id,
      ...doc.data(),
      ...updateData,
      message: 'Certificate updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating certificate', error: error.message });
  }
};

export const deleteCertificate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doc = await db.collection(CERTIFICATES_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    await db.collection(CERTIFICATES_COLLECTION).doc(id).delete();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting certificate', error: error.message });
  }
};

// Verify certificate using Certificate ID only
export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.body;

    if (!certificateId) {
      return res.status(400).json({
        message: 'Certificate ID is required',
      });
    }

    const snapshot = await db
      .collection(CERTIFICATES_COLLECTION)
      .where('certificateId', '==', certificateId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const certificate = snapshot.docs[0];
    const certData = certificate.data() as ICertificate;

    if (certData.status !== 'issued') {
      return res.status(403).json({ message: 'Certificate is not active' });
    }

    res.json({
      id: certificate.id,
      ...certData,
      message: 'Certificate verified successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error verifying certificate', error: error.message });
  }
};
