import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import InitialPage from './pages/initialPage.jsx'
import EventView from './pages/EventView.jsx'
import MyProfile from './pages/myProfile.jsx';
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
    path: "/meu-perfil",
    element: <MyProfile />,
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
)
