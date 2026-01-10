import { Request, Response } from 'express';
import { db } from '../config/database';
import { IContent, CONTENT_COLLECTION } from '../models/Content';

export const getAllContent = async (req: Request, res: Response) => {
  try {
    const { section } = req.query;
    let query = db.collection(CONTENT_COLLECTION);

    if (section) {
      query = query.where('section', '==', section);
    }

    const snapshot = await query.orderBy('order').get();
    const content = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(content);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

export const getContentById = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection(CONTENT_COLLECTION).doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { section, title, description, content, order, isActive } = req.body;

    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
    }

    const newContent: IContent = {
      section,
      title,
      description,
      content,
      order: order || 0,
      isActive: isActive !== false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(CONTENT_COLLECTION).add(newContent);

    res.status(201).json({
      message: 'Content created successfully',
      data: { id: docRef.id, ...newContent },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating content', error: error.message });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { section, title, description, content, order, isActive } = req.body;

    const updateData: any = {};
    if (section) updateData.section = section;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();

    await db.collection(CONTENT_COLLECTION).doc(id).update(updateData);

    const updatedDoc = await db.collection(CONTENT_COLLECTION).doc(id).get();

    res.json({
      message: 'Content updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating content', error: error.message });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.collection(CONTENT_COLLECTION).doc(id).delete();

    res.json({ message: 'Content deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting content', error: error.message });
  }
};
