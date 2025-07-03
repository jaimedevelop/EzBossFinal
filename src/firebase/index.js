// src/firebase/index.js
// Central export file for all Firebase functionality

// Firebase config and services
export { auth, db, storage } from './config';

// Authentication functions
export {
  signUp,
  signIn,
  signOutUser,
  resetPassword,
  onAuthStateChange,
  getCurrentUser,
  isAuthenticated,
} from './auth';

// Database operations
export {
  COLLECTIONS,
  
  // User operations
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  
  // Project operations
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  
  // Product operations
  createProduct,
  getProducts,
  
  // Estimate operations
  createEstimate,
  getEstimates,
  
  // Real-time listeners
  subscribeToProjects,
  
  // Batch operations
  batchUpdateProjects,
  
  // Utility functions
  generateDocumentNumber,
} from './database';