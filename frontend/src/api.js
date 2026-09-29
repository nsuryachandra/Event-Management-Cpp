const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const json = await res.json();
    return json;
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error: Backend server unavailable',
    };
  }
}

export const api = {
  // Events
  getEvents: () => request('/events'),
  getEvent: (id) => request(id ? `/events/${id}` : '/event'),
  createEvent: (payload) => request('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateEvent: (id, payload) => request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteEvent: (id) => request(`/events/${id}`, {
    method: 'DELETE',
  }),

  // Public Sections & Registration
  getPublicSections: (eventId) => request(`/sections/public${eventId ? `?eventId=${eventId}` : ''}`),
  register: (payload) => request('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getRegistration: (idOrEmail) => request(`/registrations/${encodeURIComponent(idOrEmail)}`),

  // Organizer Dashboard
  getDashboard: (eventId) => request(`/dashboard${eventId ? `?eventId=${eventId}` : ''}`),

  // Organizer Attendees
  getAttendees: (params = {}) => {
    const q = new URLSearchParams();
    if (params.eventId) q.append('eventId', params.eventId);
    if (params.search) q.append('search', params.search);
    if (params.status) q.append('status', params.status);
    if (params.section) q.append('section', params.section);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return request(`/attendees${queryString}`);
  },
  updateAttendee: (id, payload) => 
    request(`/attendees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  cancelAttendee: (id) => 
    request(`/attendees/${id}/cancel`, {
      method: 'POST',
    }),
  deleteAttendee: (id) => 
    request(`/attendees/${id}`, {
      method: 'DELETE',
    }),

  // Organizer FIFO Queue
  getQueue: (eventId) => request(`/queue${eventId ? `?eventId=${eventId}` : ''}`),
  admitNext: (eventId, options = {}) => {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);
    if (options.openSeat) params.append('openSeat', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/queue/admit-next${qs}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  // Organizer Sections
  getSections: (eventId) => request(`/sections${eventId ? `?eventId=${eventId}` : ''}`),
  createSection: (payload) => 
    request('/sections', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSection: (id, payload) => 
    request(`/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateSectionCapacity: (id, capacity) => 
    request(`/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ capacity }),
    }),
  deleteSection: (id) => 
    request(`/sections/${id}`, {
      method: 'DELETE',
    }),

  // Organizer Resources
  getResources: (eventId) => request(`/resources${eventId ? `?eventId=${eventId}` : ''}`),
  createResource: (payload) => 
    request('/resources', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateResource: (id, payload) => 
    request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  allocateResource: (id, quantity) => 
    request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'allocate', quantity }),
    }),
  releaseResource: (id, quantity) => 
    request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'release', quantity }),
    }),
  deleteResource: (id) => 
    request(`/resources/${id}`, {
      method: 'DELETE',
    }),

  // Organizer Activities
  getActivity: (eventId) => request(`/activity${eventId ? `?eventId=${eventId}` : ''}`),
};
