import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Attendee / Public Pages
import EventsCatalog from './pages/attendee/EventsCatalog';
import EventHome from './pages/attendee/EventHome';
import Register from './pages/attendee/Register';
import RegistrationResult from './pages/attendee/RegistrationResult';
import RegistrationStatus from './pages/attendee/RegistrationStatus';

// Organizer Console Pages
import OrganizerLayout from './components/OrganizerLayout';
import Dashboard from './pages/organizer/Dashboard';
import Events from './pages/organizer/Events';
import WaitingList from './pages/organizer/WaitingList';
import Attendees from './pages/organizer/Attendees';
import Resources from './pages/organizer/Resources';

// Public layout wrapper with Navbar & Footer
function PublicLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public Attendee Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<EventsCatalog />} />
          <Route path="/events/:id" element={<EventHome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration/:id" element={<RegistrationResult />} />
          <Route path="/status" element={<RegistrationStatus />} />
        </Route>

        {/* Organizer Console Routes */}
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="waiting-list" element={<WaitingList />} />
          <Route path="attendees" element={<Attendees />} />
          <Route path="resources" element={<Resources />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
