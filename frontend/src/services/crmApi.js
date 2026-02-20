import { authHeaders, request } from './apiClient';

export function checkHealth(requestOptions = {}) {
  return request('/health', { method: 'GET', ...requestOptions });
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export function getProfile(token, requestOptions = {}) {
  return request('/auth/profile', {
    method: 'GET',
    ...requestOptions,
    headers: {
      ...authHeaders(token),
      ...(requestOptions.headers || {})
    }
  });
}

export function getClients(token, query = 'page=1&limit=20', requestOptions = {}) {
  return request(`/clients?${query}`, {
    method: 'GET',
    ...requestOptions,
    headers: {
      ...authHeaders(token),
      ...(requestOptions.headers || {})
    }
  });
}

export function getLeads(token, query = 'page=1&limit=20', requestOptions = {}) {
  return request(`/leads?${query}`, {
    method: 'GET',
    ...requestOptions,
    headers: {
      ...authHeaders(token),
      ...(requestOptions.headers || {})
    }
  });
}

export function getSubscriptions(token, query = 'page=1&limit=20', requestOptions = {}) {
  return request(`/subscriptions?${query}`, {
    method: 'GET',
    ...requestOptions,
    headers: {
      ...authHeaders(token),
      ...(requestOptions.headers || {})
    }
  });
}

export function getEmployees(token, query = 'page=1&limit=20', requestOptions = {}) {
  return request(`/employees?${query}`, {
    method: 'GET',
    ...requestOptions,
    headers: {
      ...authHeaders(token),
      ...(requestOptions.headers || {})
    }
  });
}

export function createEmployee(token, payload) {
  return request('/employees', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function createLead(token, payload) {
  return request('/leads', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}

export function updateLead(token, leadId, payload) {
  return request(`/leads/${leadId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload)
  });
}
