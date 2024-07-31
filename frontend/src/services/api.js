import axios from "axios";

const api = axios.create({
  baseURL: "https://217zppvc6c.execute-api.us-east-1.amazonaws.com/Prod",
});

export default api;
