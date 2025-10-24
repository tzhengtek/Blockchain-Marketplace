import axios from "axios";

const apiUrl = process.env.URL_API;

export async function getTransactions() {
  console.log("API URL:", apiUrl);
  const response = await axios.get(`http://localhost:3000/api/transaction`);
  if (response.status !== 200) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  return response.data;
}
