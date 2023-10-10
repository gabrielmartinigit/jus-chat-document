import axios from "axios";

const api = axios.create({
  baseURL: "<YOUR API ENDPOINT>",
});

export default api;
