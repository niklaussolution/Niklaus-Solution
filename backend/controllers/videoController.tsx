import { Request, Response } from 'express';
import { db } from '../config/database';
import { IVideo, VIDEOS_COLLECTION } from '../models/Video';

export const getAllVideos = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection(VIDEOS_COLLECTION).where('isActive', '==', true).orderBy('order').get();
    const videos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(videos);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const doc = await db.collection(VIDEOS_COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching video', error: error.message });
  }
};

export const createVideo = async (req: Request, res: Response) => {
  try {
    const { title, youtubeUrl, thumbnail, order, isActive } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({ message: 'Title and YouTube URL are required' });
    }

    const newVideo: IVideo = {
      title,
      youtubeUrl,
      thumbnail: thumbnail || '',
      order: order || 0,
      isActive: isActive !== false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = await db.collection(VIDEOS_COLLECTION).add(newVideo);

    res.status(201).json({
      message: 'Video created successfully',
      data: { id: docRef.id, ...newVideo },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, youtubeUrl, thumbnail, order, isActive } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (youtubeUrl) updateData.youtubeUrl = youtubeUrl;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();

    await db.collection(VIDEOS_COLLECTION).doc(id).update(updateData);

    const updatedDoc = await db.collection(VIDEOS_COLLECTION).doc(id).get();

    res.json({
      message: 'Video updated successfully',
      data: { id: updatedDoc.id, ...updatedDoc.data() },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.collection(VIDEOS_COLLECTION).doc(id).delete();

    res.json({ message: 'Video deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
};
