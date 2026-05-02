import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

export const col = (name: string) => collection(db, name);

export function listen<T>(
  name: string,
  cb: (rows: (T & { id: string })[]) => void,
  ...constraints: QueryConstraint[]
) {
  const q = constraints.length ? query(col(name), ...constraints) : col(name);
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
    cb(rows as (T & { id: string })[]);
  });
}

export async function listAll<T>(name: string): Promise<(T & { id: string })[]> {
  const snap = await getDocs(col(name));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) })) as (T & { id: string })[];
}

export async function add<T extends Record<string, any>>(name: string, data: T) {
  return addDoc(col(name), data);
}
export async function update<T extends Record<string, any>>(name: string, id: string, data: Partial<T>) {
  return updateDoc(doc(db, name, id), data as any);
}
export async function remove(name: string, id: string) {
  return deleteDoc(doc(db, name, id));
}

export async function bulkInsert(name: string, rows: Record<string, any>[]) {
  const chunkSize = 400;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const batch = writeBatch(db);
    rows.slice(i, i + chunkSize).forEach((r) => {
      const ref = doc(col(name));
      batch.set(ref, r);
    });
    await batch.commit();
  }
}

export { where, orderBy, query };
