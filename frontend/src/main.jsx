import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import InitialPage from './pages/initialPage.jsx'
import EventView from './pages/EventView.jsx'
import MyProfile from './pages/MyProfile.jsx';
import MyInscriptions from './pages/MyInscriptions.jsx';
import EventRegistration from './pages/EventRegistration.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import EditEvent from './pages/EditEvent.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import {createBrowserRouter, RouterProvider} from "react-router-dom"

const router = createBrowserRouter([
  {
    path: "/",
    element: <InitialPage />,
  },
  {
    path: "/evento/:id",
    element: <EventView/>,
  }, 
  {
    path: "/evento/:id/inscricao",
    element: (
      <ProtectedRoute>
        <EventRegistration/>
      </ProtectedRoute>
    ),
  },
  {
    path: "/evento/:id/editar",
    element: (
      <ProtectedRoute>
        <EditEvent/>
      </ProtectedRoute>
    ),
  },
  {
    path: "/evento/criar",
    element: (
      <ProtectedRoute>
        <CreateEvent/>
      </ProtectedRoute>
    ),
  },
  {
    path: "/meu-perfil",
    element: (
      <ProtectedRoute>
        <MyProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/minhas-inscricoes",
    element: (
      <ProtectedRoute>
        <MyInscriptions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/registro",
    element: <Register />,
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
