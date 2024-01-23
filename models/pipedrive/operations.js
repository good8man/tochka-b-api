const axios = require("axios");

const { API_TOKEN, BASE_URL } = process.env;
axios.defaults.baseURL = BASE_URL;

const searchPerson = async term => {
  const params = { term, limit: 1, exact_match: true, api_token: API_TOKEN };
  const { data } = await axios.get("/persons/search", { params });
  return data ? data.data.items : [];
};

const addPerson = async person => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.post("/persons", person, { params });
  return data ? data.data : {};
};

const editPerson = async (id, person) => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.put(`/persons/${id}`, person, { params });
  return data ? data.data : {};
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

const addDeal = async deal => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.post("/deals", deal, { params });
  return data ? data.data : {};
};

const editDeal = async (id, deal) => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.put(`/deals/${id}`, deal, { params });
  return data ? data.data : {};
};

const duplicateDeal = async id => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.post(`/deals/${id}/duplicate`, null, { params });
  return data ? data.data : {};
};

const addNote = async note => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.post("/notes", note, { params });
  return data ? data.data : {};
};

const addActivities = async activities => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.post("/activities", activities, { params });
  return data ? data.data : {};
};

module.exports = {
  searchPerson,
  editPerson,
  addPerson,
  addNote,
  addDeal,
  editDeal,
  searchDeal,
  duplicateDeal,
  addActivities,
  getDealDetails,
};