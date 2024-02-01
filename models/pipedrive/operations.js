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

const searchDeal = async search => {
  const params = { api_token: API_TOKEN, ...search };
  const { data } = await axios.get("/deals/search", { params });
  return data ? data.data.items : [];
};

const searchAllDeals = async ids => {
  const params = { api_token: API_TOKEN };
  const response = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const { data } = await axios.get(`/persons/${id}/deals`, { params });
    if (data.data && data.data.length > 0) response.push( ...data.data );
  }
  return response;
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


const getNotes = async id => {
  const params = { api_token: API_TOKEN, deal_id: id };
  const { data } = await axios.get("/notes", { params });
  return data ? data.data : {};
};

const addActivities = async activities => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.post("/activities", activities, { params });
  return data ? data.data : {};
};

const getActivities = async id => {
  const params = { api_token: API_TOKEN };
  const { data } = await axios.get(`/deals/${id}/activities`, { params });

  return data ? data.data : {};
};

module.exports = {
  searchPerson,
  editPerson,
  addPerson,
  getNotes,
  addNote,
  addDeal,
  editDeal,
  searchDeal,
  getActivities,
  duplicateDeal,
  addActivities,
  searchAllDeals,
  getDealDetails,
};