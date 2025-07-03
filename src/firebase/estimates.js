// firebase/estimates.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Collection reference
const estimatesCollection = collection(db, 'estimates');

/**
 * Generate the next estimate number for the given year
 * @param {number} year - The year for which to generate the estimate number
 * @returns {Promise<string>} - The next estimate number (e.g., "EST-2025-001")
 */
export const generateEstimateNumber = async (year) => {
  try {
    // Query for estimates from the current year
    const yearStart = `EST-${year}-`;
    const yearEnd = `EST-${year}-ZZZ`;
    
    const q = query(
      estimatesCollection,
      where('estimateNumber', '>=', yearStart),
      where('estimateNumber', '<', yearEnd),
      orderBy('estimateNumber', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // First estimate of the year
      return `EST-${year}-001`;
    }
    
    // Get the last estimate number and increment
    const lastEstimate = snapshot.docs[0].data();
    const lastNumber = parseInt(lastEstimate.estimateNumber.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    
    return `EST-${year}-${nextNumber}`;
  } catch (error) {
    console.error('Error generating estimate number:', error);
    throw error;
  }
};

/**
 * Create a new estimate
 * @param {Object} estimateData - The estimate data
 * @returns {Promise<string>} - The ID of the created estimate
 */
export const createEstimate = async (estimateData) => {
  try {
    const currentYear = new Date().getFullYear();
    const estimateNumber = await generateEstimateNumber(currentYear);
    
    const estimate = {
      ...estimateData,
      estimateNumber,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    };
    
    const docRef = await addDoc(estimatesCollection, estimate);
    return docRef.id;
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
};

/**
 * Update an existing estimate
 * @param {string} estimateId - The ID of the estimate to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateEstimate = async (estimateId, updateData) => {
  try {
    const estimateRef = doc(db, 'estimates', estimateId);
    await updateDoc(estimateRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating estimate:', error);
    throw error;
  }
};

/**
 * Get all estimates
 * @returns {Promise<Array>} - Array of estimates with IDs
 */
export const getAllEstimates = async () => {
  try {
    const q = query(estimatesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting estimates:', error);
    throw error;
  }
};

/**
 * Get estimates by status
 * @param {string} status - The status to filter by
 * @returns {Promise<Array>} - Array of estimates with the specified status
 */
export const getEstimatesByStatus = async (status) => {
  try {
    const q = query(
      estimatesCollection, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting estimates by status:', error);
    throw error;
  }
};

/**
 * Get estimates for a specific project
 * @param {string} projectId - The project ID
 * @returns {Promise<Array>} - Array of estimates for the project
 */
export const getEstimatesByProject = async (projectId) => {
  try {
    const q = query(
      estimatesCollection, 
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting estimates by project:', error);
    throw error;
  }
};

/**
 * Get a single estimate by ID
 * @param {string} estimateId - The estimate ID
 * @returns {Promise<Object|null>} - The estimate data or null if not found
 */
export const getEstimateById = async (estimateId) => {
  try {
    const estimateRef = doc(db, 'estimates', estimateId);
    const snapshot = await getDoc(estimateRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting estimate by ID:', error);
    throw error;
  }
};

/**
 * Update estimate status
 * @param {string} estimateId - The estimate ID
 * @param {string} status - The new status
 * @returns {Promise<void>}
 */
export const updateEstimateStatus = async (estimateId, status) => {
  try {
    await updateEstimate(estimateId, { status });
  } catch (error) {
    console.error('Error updating estimate status:', error);
    throw error;
  }
};

/**
 * Duplicate an estimate
 * @param {string} estimateId - The ID of the estimate to duplicate
 * @returns {Promise<string>} - The ID of the new estimate
 */
export const duplicateEstimate = async (estimateId) => {
  try {
    const originalEstimate = await getEstimateById(estimateId);
    if (!originalEstimate) {
      throw new Error('Estimate not found');
    }
    
    // Remove ID and timestamps, reset status
    const { id, createdAt, updatedAt, estimateNumber, ...estimateData } = originalEstimate;
    
    // Create new estimate with duplicated data
    const newEstimateId = await createEstimate({
      ...estimateData,
      status: 'draft',
      // Clear some fields that should be unique
      customerName: estimateData.customerName + ' (Copy)',
    });
    
    return newEstimateId;
  } catch (error) {
    console.error('Error duplicating estimate:', error);
    throw error;
  }
};

/**
 * Delete an estimate
 * @param {string} estimateId - The ID of the estimate to delete
 * @returns {Promise<void>}
 */
export const deleteEstimate = async (estimateId) => {
  try {
    const estimateRef = doc(db, 'estimates', estimateId);
    await deleteDoc(estimateRef);
  } catch (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
};

/**
 * Get estimates created within a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of estimates within the date range
 */
export const getEstimatesByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      estimatesCollection,
      where('createdDate', '>=', startDate),
      where('createdDate', '<=', endDate),
      orderBy('createdDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting estimates by date range:', error);
    throw error;
  }
};

/**
 * Search estimates by customer name
 * @param {string} customerName - The customer name to search for
 * @returns {Promise<Array>} - Array of estimates matching the customer name
 */
export const searchEstimatesByCustomer = async (customerName) => {
  try {
    // Note: Firestore doesn't support case-insensitive search well
    // For better search functionality, consider using Algolia or similar
    const q = query(
      estimatesCollection,
      where('customerName', '>=', customerName),
      where('customerName', '<=', customerName + '\uf8ff'),
      orderBy('customerName'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching estimates by customer:', error);
    throw error;
  }
};
