import type { SealRegistration, SealRegistrationStatus } from "./types";

const API_BASE = "http://localhost:8787/api";

type ApiResponse<T> = { data: T };
type ApiError = { error: string; issues?: Record<string, string[]> };

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      error: `HTTP ${res.status}`,
    }));
    throw new Error(err.error);
  }
  const json: ApiResponse<T> = await res.json();
  return json.data;
};

export const apiClient = {
  getAll: (): Promise<SealRegistration[]> =>
    fetch(`${API_BASE}/registrations`).then(handleResponse<SealRegistration[]>),

  search: (query: {
    id?: string;
    name?: string;
    address?: string;
  }): Promise<SealRegistration[]> => {
    const params = new URLSearchParams();
    if (query.id) params.set("id", query.id);
    if (query.name) params.set("name", query.name);
    if (query.address) params.set("address", query.address);
    return fetch(`${API_BASE}/registrations?${params}`).then(
      handleResponse<SealRegistration[]>
    );
  },

  getById: (id: string): Promise<SealRegistration> =>
    fetch(`${API_BASE}/registrations/${id}`).then(
      handleResponse<SealRegistration>
    ),

  create: (
    fields: {
      name: string;
      nameKana: string;
      dateOfBirth: string;
      gender: "男" | "女";
      postalCode: string;
      address: string;
      addressDetail: string;
      mailingNumber: string;
      householdNumber: string;
      sealName: string;
    },
    sealImage?: File
  ): Promise<SealRegistration> => {
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.set(k, v));
    if (sealImage) formData.set("sealImage", sealImage);
    return fetch(`${API_BASE}/registrations`, {
      method: "POST",
      body: formData,
    }).then(handleResponse<SealRegistration>);
  },

  updateStatus: (
    id: string,
    status: SealRegistrationStatus
  ): Promise<SealRegistration> =>
    fetch(`${API_BASE}/registrations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(handleResponse<SealRegistration>),
};
