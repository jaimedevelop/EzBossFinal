// src/firebase/database.js
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ESTIMATES: 'estimates',
  INVOICES: 'invoices',
  LINE_ITEMS: 'lineItems',
  PROJECT_ITEMS: 'projectItems',
  TEMPLATES: 'templates',
  FILES: 'files',
};

// === USER OPERATIONS ===
export const createUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // If document doesn't exist, create it
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (createError) {
      console.error('Error creating user profile:', createError);
      return { success: false, error: createError };
    }
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: { id: userSnap.id, ...userSnap.data() } };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};

// === PROJECTS OPERATIONS ===
export const createProject = async (projectData) => {
  try {
    const projectRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: projectRef.id };
  } catch (error) {
    console.error('Error creating project:', error);
    return { success: false, error };
  }
};

export const getProjects = async (userId, filters = {}) => {
  try {
    let q = collection(db, COLLECTIONS.PROJECTS);
    
    // Add filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    // Order by creation date (newest first)
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error getting projects:', error);
    return { success: false, error };
  }
};

export const getProject = async (projectId) => {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      return { success: true, data: { id: projectSnap.id, ...projectSnap.data() } };
    } else {
      return { success: false, error: 'Project not found' };
    }
  } catch (error) {
    console.error('Error getting project:', error);
    return { success: false, error };
  }
};

export const updateProject = async (projectId, projectData) => {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await updateDoc(projectRef, {
      ...projectData,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    return { success: false, error };
  }
};

export const deleteProject = async (projectId) => {
  try {
    const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
    await deleteDoc(projectRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error };
  }
};

// === PRODUCTS OPERATIONS ===
export const createProduct = async (productData) => {
  try {
    const productRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...productData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: productRef.id };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error };
  }
};

export const getProducts = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTIONS.PRODUCTS);
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters.productType) {
      q = query(q, where('productType', '==', filters.productType));
    }
    
    q = query(q, orderBy('name', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, data: products };
  } catch (error) {
    console.error('Error getting products:', error);
    return { success: false, error };
  }
};

// === ESTIMATES OPERATIONS ===
export const createEstimate = async (estimateData) => {
  try {
    const estimateRef = await addDoc(collection(db, COLLECTIONS.ESTIMATES), {
      ...estimateData,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: estimateRef.id };
  } catch (error) {
    console.error('Error creating estimate:', error);
    return { success: false, error };
  }
};

export const getEstimates = async (filters = {}) => {
  try {
    let q = collection(db, COLLECTIONS.ESTIMATES);
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.projectId) {
      q = query(q, where('projectId', '==', filters.projectId));
    }
    
    q = query(q, orderBy('date', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const estimates = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return { success: true, data: estimates };
  } catch (error) {
    console.error('Error getting estimates:', error);
    return { success: false, error };
  }
};

// === REAL-TIME LISTENERS ===
export const subscribeToProjects = (callback, filters = {}) => {
  try {
    let q = collection(db, COLLECTIONS.PROJECTS);
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(projects);
    });
  } catch (error) {
    console.error('Error subscribing to projects:', error);
    return null;
  }
};

// === BATCH OPERATIONS ===
export const batchUpdateProjects = async (updates) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ id, data }) => {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
      batch.update(projectRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error batch updating projects:', error);
    return { success: false, error };
  }
};

// === UTILITY FUNCTIONS ===
export const generateDocumentNumber = async (collection, prefix = '') => {
  try {
    const q = query(collection(db, collection), orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return `${prefix}001`;
    }
    
    const lastDoc = querySnapshot.docs[0];
    const lastNumber = lastDoc.data().number || `${prefix}000`;
    const numberPart = parseInt(lastNumber.replace(prefix, '')) + 1;
    
    return `${prefix}${numberPart.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating document number:', error);
    return `${prefix}${Date.now()}`;
  }
};