import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import MetaDesigner from "./pages/MetaDesigner"
import DashBoard from './pages/DashBoard'
import MetaRoom from "./pages/MetaRoom"

const router = createBrowserRouter([
  {
    path: "/desginer",
    Component: MetaDesigner,
  },
  {
    path: "/room",
    Component: MetaRoom,
  },
  {
    path: '/dashboard',
    Component: DashBoard,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" />,
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
