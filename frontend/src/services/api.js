import axios from "axios";

const api = axios.create({
  baseURL: "https://upb2u6561j.execute-api.us-east-1.amazonaws.com/Prod/",
});

export default api;
