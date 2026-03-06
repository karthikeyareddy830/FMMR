/**
 * api.js — Axios service for calling the FastAPI backend
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000, // LLM calls can take a few seconds
});

/**
 * Submit a medical question to the RAG backend.
 *
 * @param {string} query     - The user's question.
 * @param {number} topK      - Number of documents to retrieve (default 5).
 * @param {string} language  - Language code: "en" | "hi" | "te".
 * @returns {Promise<QueryResponse>}
 */
export async function askQuestion(query, topK = 5, language = "en") {
  const response = await apiClient.post("/query", {
    query,
    top_k: topK,
    language,
  });
  return response.data;
}

/**
 * Health check — confirm the backend is reachable.
 * @returns {Promise<{ status: string }>}
 */
export async function checkHealth() {
  const response = await apiClient.get("/health");
  return response.data;
}
