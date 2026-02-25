import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Place a bid on a product
export const placeBid = async (productId, bidAmount) => {
  try {
    const response = await axios.post(
      `${API_URL}/bids/${productId}`,
      { bidAmount },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to place bid' };
  }
};

// Get all bids for a product
export const getBidsForProduct = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/bids/${productId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch bids' };
  }
};

// Get highest bid for a product
export const getHighestBid = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/bids/${productId}/highest`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch highest bid' };
  }
};

// Check if user has placed a bid on a product
export const checkUserBid = async (productId) => {
  try {
    const response = await axios.get(
      `${API_URL}/bids/${productId}/user-bid`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to check user bid' };
  }
};

// Execute buyout for a bidding product
export const executeBuyout = async (productId) => {
  try {
    const response = await axios.post(
      `${API_URL}/bids/${productId}/buyout`,
      {},
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to execute buyout' };
  }
};

export default {
  placeBid,
  getBidsForProduct,
  getHighestBid,
  checkUserBid,
  executeBuyout
};
