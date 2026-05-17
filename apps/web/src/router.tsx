import { createBrowserRouter } from 'react-router'
import App from './App'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])
