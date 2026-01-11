import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';

import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/events" replace /> },
      { path: 'events', element: <EventsList /> },
      { path: 'events/:id', element: <EventDetails /> },
      { path: 'events/new', element: <CreateEvent /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
