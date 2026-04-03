import api from './axios';

export const getAllSpots = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.priceRange) params.append('priceRange', filters.priceRange);
  const response = await api.get(`/spots?${params.toString()}`);
  return response.data;
};

export const getSpotById = async (id) => {
  const response = await api.get(`/spots/${id}`);
  return response.data;
};

export const createSpot = async (spotData, userId) => {
  const response = await api.post('/spots', { ...spotData, createdBy: userId });
  return response.data;
};

export const updateSpot = async (id, spotData) => {
  const response = await api.put(`/spots/${id}`, spotData);
  return response.data;
};

export const deleteSpot = async (id) => {
  const response = await api.delete(`/spots/${id}`);
  return response.data;
};