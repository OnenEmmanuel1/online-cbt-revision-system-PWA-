import { openDB } from 'idb';

const DB_NAME = 'CBTR_OfflineDB';
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'courseId' });
      }
      if (!db.objectStoreNames.contains('offline_sessions')) {
        db.createObjectStore('offline_sessions', { keyPath: 'localId', autoIncrement: true });
      }
    },
  });
};

// Save a downloaded course to IndexedDB
export const saveCourseOffline = async (courseData) => {
  const db = await initDB();
  await db.put('courses', courseData);
};

// Retrieve a downloaded course
export const getOfflineCourse = async (courseId) => {
  const db = await initDB();
  return db.get('courses', parseInt(courseId, 10));
};

export const getAllOfflineCourses = async () => {
  const db = await initDB();
  return db.getAll('courses');
};

// Save a completed session offline to be synced later
export const saveOfflineSession = async (sessionData) => {
  const db = await initDB();
  return db.add('offline_sessions', sessionData);
};

// Get all pending offline sessions
export const getPendingOfflineSessions = async () => {
  const db = await initDB();
  return db.getAll('offline_sessions');
};

// Remove synced sessions
export const removeOfflineSession = async (localId) => {
  const db = await initDB();
  await db.delete('offline_sessions', localId);
};
