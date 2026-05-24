import { createBrowserRouter } from 'react-router'
import App from './App'
import AppLayout from './layouts/AppLayout'
import RequireAdmin from './layouts/RequireAdmin'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        element: <RequireAdmin />,
        children: [
          { path: '/users', element: <UsersPage /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])
