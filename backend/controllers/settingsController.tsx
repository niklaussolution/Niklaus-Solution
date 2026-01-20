import { Request, Response } from 'express';
import { db } from '../config/database';
import { SETTINGS_COLLECTION } from '../models/Settings';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection(SETTINGS_COLLECTION).get();
    const settingsObj: any = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      settingsObj[data.key] = data.value;
    });

    res.json(settingsObj);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settingsData = req.body;

    for (const [key, value] of Object.entries(settingsData)) {
      await db.collection(SETTINGS_COLLECTION).doc(key).set({
        key,
        value,
        updatedAt: Date.now(),
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

export const getSettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const doc = await db.collection(SETTINGS_COLLECTION).doc(key).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    const data = doc.data();
    res.json({ [key]: data?.value });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};
