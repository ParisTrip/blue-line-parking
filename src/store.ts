import { openDB, type IDBPDatabase } from 'idb';
import type { CurbEdit, ParkedHere, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './config';

const DB_NAME = 'jp-parking';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('edits')) {
          db.createObjectStore('edits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// --- Curb Edits ---

export async function getAllEdits(): Promise<CurbEdit[]> {
  const db = await getDB();
  return db.getAll('edits');
}

export async function saveEdit(edit: CurbEdit): Promise<void> {
  const db = await getDB();
  await db.put('edits', edit);
}

export async function deleteEdit(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('edits', id);
}

export async function exportEdits(): Promise<string> {
  const edits = await getAllEdits();
  return JSON.stringify(edits, null, 2);
}

export async function importEdits(json: string): Promise<CurbEdit[]> {
  const edits = JSON.parse(json) as CurbEdit[];
  const db = await getDB();
  const tx = db.transaction('edits', 'readwrite');
  for (const edit of edits) {
    await tx.store.put(edit);
  }
  await tx.done;
  return edits;
}

// --- Parked Here ---

const PARKED_KEY = 'jp-parked-here';
const PARKED_EXPIRY_MS = 18 * 60 * 60 * 1000;

export function getParkedHere(): ParkedHere | null {
  const raw = localStorage.getItem(PARKED_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as ParkedHere;
    if (Date.now() - data.timestamp > PARKED_EXPIRY_MS) {
      localStorage.removeItem(PARKED_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setParkedHere(lat: number, lng: number): ParkedHere {
  const data: ParkedHere = { lat, lng, timestamp: Date.now() };
  localStorage.setItem(PARKED_KEY, JSON.stringify(data));
  return data;
}

export function clearParkedHere(): void {
  localStorage.removeItem(PARKED_KEY);
}

// --- Settings ---

const SETTINGS_KEY = 'jp-settings';

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// --- Data Cache ---

const CACHE_TIMESTAMP_KEY = 'jp-data-cache-ts';
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

export function isDataCacheStale(): boolean {
  const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!ts) return true;
  return Date.now() - parseInt(ts, 10) > CACHE_EXPIRY_MS;
}

export function markDataCacheRefreshed(): void {
  localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));
}
