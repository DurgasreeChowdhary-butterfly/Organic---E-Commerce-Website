import { apiClient } from "./apiClient";
import type { ChatResponse } from "@/types";

export async function sendChatMessage(sessionId: string, message: string): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chatbot/message", { session_id: sessionId, message });
  return data;
}
