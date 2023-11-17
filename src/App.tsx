import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import MetaDesigner from "./pages/MetaDesigner"
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
    path: '/',
    element: <Navigate to="/desginer" />,
  }
])

function App() {
  return <RouterProvider router={router} />
}

export default App
