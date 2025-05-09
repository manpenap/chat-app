import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPreviousConversation = async (topic, token) => {
  return axios.get(`${API_URL}/chat/last-conversation`, {
    params: { topic },
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const saveConversation = async (conversation, topic, token) => {
  return axios.post(
    `${API_URL}/chat/save-conversation`,
    { conversation, topic },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const sendMessageToBot = async (payload, token) => {
  return axios.post(`${API_URL}/chat`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};