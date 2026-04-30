// ====================================
// FIREBASE CONFIG
// ====================================
// 1. Йдеш на https://console.firebase.google.com
// 2. Створюєш проект "king-shop"
// 3. Додаєш Web App
// 4. Копіюєш сюди свої ключі замість плейсхолдерів
// 5. Активуєш Firestore Database (Test mode)
// 6. Активуєш Storage (для фото)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getFirestore, collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// ⚠️ ЗАМІНИ ЦЕ НА СВОЇ КЛЮЧІ З FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "ВСТАВ_СЮДИ_СВІЙ_КЛЮЧ",
  authDomain: "king-shop-XXXXX.firebaseapp.com",
  projectId: "king-shop-XXXXX",
  storageBucket: "king-shop-XXXXX.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "1:XXXXXXX:web:XXXXXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ====================================
// PRODUCTS
// ====================================
export async function loadProducts() {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveProduct(product) {
  if(product.id && typeof product.id === 'string' && product.id.length > 5) {
    const { id, ...data } = product;
    await updateDoc(doc(db, 'products', id), data);
    return product;
  } else {
    const { id, ...data } = product;
    const ref = await addDoc(collection(db, 'products'), data);
    return { id: ref.id, ...data };
  }
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, 'products', id));
}

// ====================================
// ORDERS
// ====================================
export async function loadOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveOrder(order) {
  const data = { ...order, createdAt: Date.now() };
  delete data.id;
  const ref = await addDoc(collection(db, 'orders'), data);
  return { id: ref.id, ...data };
}

export async function updateOrderStatus(orderId, status) {
  await updateDoc(doc(db, 'orders', orderId), { status });
}

// Real-time listener for orders (admin)
export function listenOrders(callback) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ====================================
// NEWS
// ====================================
export async function loadNews() {
  const snap = await getDocs(collection(db, 'news'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveNews(item) {
  if(item.id && typeof item.id === 'string' && item.id.length > 5) {
    const { id, ...data } = item;
    await updateDoc(doc(db, 'news', id), data);
    return item;
  } else {
    const { id, ...data } = item;
    const ref = await addDoc(collection(db, 'news'), data);
    return { id: ref.id, ...data };
  }
}

export async function deleteNews(id) {
  await deleteDoc(doc(db, 'news', id));
}

// ====================================
// STORE SETTINGS
// ====================================
export async function loadSettings() {
  const docRef = doc(db, 'settings', 'store');
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function saveSettings(data) {
  await updateDoc(doc(db, 'settings', 'store'), data);
}

// ====================================
// PHOTO UPLOAD
// ====================================
export async function uploadPhoto(file, folder = 'products') {
  const filename = `${folder}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deletePhoto(url) {
  try {
    const photoRef = ref(storage, url);
    await deleteObject(photoRef);
  } catch(e) {
    console.warn('Photo delete failed:', e);
  }
}

// ====================================
// USERS / AUTH (simple by phone)
// ====================================
export async function findUserByPhone(phone) {
  const q = query(collection(db, 'users'), where('phone', '==', phone));
  const snap = await getDocs(q);
  return snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
}

export async function createUser(name, phone) {
  const ref = await addDoc(collection(db, 'users'), { name, phone, createdAt: Date.now() });
  return { id: ref.id, name, phone };
}
