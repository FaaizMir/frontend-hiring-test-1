// src/api/calls.js

import axios from "axios";
import { axiosWithAutoRefresh, getAuthHeader } from "./auth";

// Base URL for the API
const BASE_URL = "https://frontend-test-api.aircall.dev";

// Fetch a paginated list of calls from the API
export const getCalls = async (offset = 0, limit = 10) => {
  return axiosWithAutoRefresh(() =>
    axios.get(
      `${BASE_URL}/calls?offset=${offset}&limit=${limit}`,
      getAuthHeader() // adds the auth token in headers
    )
  ).then((res) => res.data); // return the actual data
};

// Archive a specific call by its ID
export const archiveCall = async (id) => {
  return axiosWithAutoRefresh(() =>
    axios.put(`${BASE_URL}/calls/${id}/archive`, null, getAuthHeader())
  ).then((res) => res.data);
};

// Add a note to a specific call
export const addNoteToCall = async (id, content) => {
  return axiosWithAutoRefresh(() =>
    axios.post(
      `${BASE_URL}/calls/${id}/note`,
      { content }, // note content being sent
      getAuthHeader()
    )
  ).then((res) => res.data);
};
