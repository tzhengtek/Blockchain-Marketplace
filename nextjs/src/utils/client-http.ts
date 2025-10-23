import axios from "axios";

const clientAxios = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default clientAxios;
