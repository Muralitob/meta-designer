import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import MetaDesigner from "./pages/MachineRoom/MetaDesigner"
import DashBoard from './pages/DashBoard'
import MetaRoom from "./pages/MachineRoom/MetaRoom"

const router = createBrowserRouter([
  {
    path: '/dashboard',
    Component: DashBoard,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" />,
  },
  {
    path: "/room-desginer",
    Component: MetaDesigner,
  },
  {
    path: "/room-show",
    Component: MetaRoom,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
