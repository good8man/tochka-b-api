const axios = require("axios");

const { API_TOKEN, BASE_URL } = process.env;
axios.defaults.baseURL = BASE_URL;

const searchPerson = async (term) => {
  const params = { term, fields: "phone", limit: 1, api_token: API_TOKEN };
  const { data } = await axios.get("/persons/search", { params });
  return data ? data.data.items : [];
};

const searchDeal = async (term) => {
  const params = { term, custom_fields: "phone", api_token: API_TOKEN };
  const { data } = await axios.get("/deals/search", { params });
  return data ? data.data.items : [];
};

const getDealDetails = async (ids) => {
  const params = { api_token: API_TOKEN };
  const response = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const { data } = await axios.get(`/deals/${id}`, { params });
    response.push({ ...data.data });
  }
  return response;
};

module.exports = {
  searchPerson,
  searchDeal,
  getDealDetails,
};