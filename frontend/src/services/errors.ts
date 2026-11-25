import axios from "axios";

/** Turns an Axios / DRF error payload into a readable message. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the server. Is the Django backend running on port 8000?";
    }
    const data = error.response.data as Record<string, unknown> | undefined;
    if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        return data.detail;
      }
      const first = Object.entries(data)[0];
      if (first) {
        const [field, messages] = first;
        const message = Array.isArray(messages) ? String(messages[0]) : String(messages);
        return field === "non_field_errors" ? message : `${field.replace(/_/g, " ")}: ${message}`;
      }
    }
  }
  return fallback;
}
