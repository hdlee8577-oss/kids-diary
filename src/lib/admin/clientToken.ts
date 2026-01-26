"use client";

const KEY = "kids-diary:adminToken";

export function getAdminToken(): string {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // ignore
  }
}

