import axios from "axios";

import { hashResponseSchema } from "@/lib/validation";

const apiClient = axios.create({
  withCredentials: false,
});

export async function uploadAndRegister(formData: FormData) {
  const response = await apiClient.post("/api/hash", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return hashResponseSchema.parse(response.data);
}

// fetchResult removed because SSR page reads from server store directly

