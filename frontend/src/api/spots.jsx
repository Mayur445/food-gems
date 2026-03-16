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

export const createSpot = async (spotData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const response = await api.post('/spots', {
    ...spotData,
    createdBy: user.id
  });
  return response.data;
};

export const uploadPhoto = async (spotId, formData) => {
  const response = await api.post(`/spots/${spotId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};