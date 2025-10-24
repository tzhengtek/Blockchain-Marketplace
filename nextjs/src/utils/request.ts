import axios from "axios";

export async function getTransactions(pagination: { page: number }) {
  const response = await axios.get(`http://localhost:3000/api/transaction`, {
    params: {
      pagination: pagination.page,
    },
  });
  console.log("getTransactions response:", response);
  if (response.status !== 200) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  return response.data;
}
