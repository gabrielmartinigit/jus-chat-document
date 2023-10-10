import axios from "axios";

const api = axios.create({
  baseURL: "https://kkbiqqy163.execute-api.us-east-1.amazonaws.com/Prod",
});

export default api;
