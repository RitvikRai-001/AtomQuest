const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

type ApiOptions = RequestInit & {
  token?: string;
};

export const authTokenKey = "atomquest_access_token";

export const getStoredToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(authTokenKey) || "";
};

export const setStoredToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(authTokenKey, token);
};

export const clearStoredToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(authTokenKey);
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = options.token || getStoredToken();
  const url = `${API_BASE_URL}${path}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Cannot reach the backend at ${API_BASE_URL}. Check that the API server is running and CORS allows this frontend origin.`
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `API request failed (${response.status})`);
  }

  return data;
}

export const goalSheetApi = {
  getMyGoalSheet: () => apiRequest("/goal-sheets/me"),
  getManagerApprovalQueue: () => apiRequest("/goal-sheets/manager/approval-queue"),
  getGoalSheet: (goalSheetId: string) => apiRequest(`/goal-sheets/${goalSheetId}`),
  createGoalSheet: (cycleId: string) =>
    apiRequest("/goal-sheets", {
      method: "POST",
      body: JSON.stringify({ cycleId }),
    }),
  addGoal: (goalSheetId: string, body: unknown) =>
    apiRequest(`/goal-sheets/${goalSheetId}/goals`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateGoal: (goalSheetId: string, goalId: string, body: unknown) =>
    apiRequest(`/goal-sheets/${goalSheetId}/goals/${goalId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  submitGoalSheet: (goalSheetId: string) =>
    apiRequest(`/goal-sheets/${goalSheetId}/submit`, { method: "POST" }),
  approveGoalSheet: (goalSheetId: string, body: unknown) =>
    apiRequest(`/goal-sheets/${goalSheetId}/approve`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  returnGoalSheet: (goalSheetId: string, comment: string) =>
    apiRequest(`/goal-sheets/${goalSheetId}/return`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    }),
};

export const authApi = {
  login: (body: { email: string; password: string; role: "employee" | "manager" | "admin" }) =>
    apiRequest<{ success: boolean; data: { accessToken: string; user: any } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

export const achievementApi = {
  getGoalSheetAchievements: (goalSheetId: string) =>
    apiRequest(`/achievements/goal-sheets/${goalSheetId}`),
  updateAchievement: (goalId: string, body: unknown) =>
    apiRequest(`/achievements/goals/${goalId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  previewProgress: (goalId: string, actual: string) =>
    apiRequest(`/achievements/goals/${goalId}/preview-progress`, {
      method: "POST",
      body: JSON.stringify({ actual }),
    }),
};

export const checkinApi = {
  getGoalSheetCheckins: (goalSheetId: string) =>
    apiRequest(`/checkins/goal-sheets/${goalSheetId}`),
  addCheckin: (goalId: string, body: unknown) =>
    apiRequest(`/checkins/goals/${goalId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const feedbackApi = {
  requestFeedback: (message?: string) =>
    apiRequest("/feedback/request", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

export const adminApi = {
  getCycles: () => apiRequest("/admin/cycles"),
  createCycle: (body: unknown) =>
    apiRequest("/admin/cycles", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getCycle: (cycleId: string) => apiRequest(`/admin/cycles/${cycleId}`),
  createWindow: (cycleId: string, body: unknown) =>
    apiRequest(`/admin/cycles/${cycleId}/windows`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
