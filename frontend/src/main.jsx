import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import Reuniones from '@pages/Reuniones';
import Tokens from '@pages/Tokens';
import DetalleReunion from '@pages/DetalleReunion';
import Movfin from '@pages/movfin';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';
import Publicacion from '@pages/DetallePublicacion.jsx';
import DetallePublicacion from '@pages/DetallePublicacion.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/users',
        element: <Users />
      },
      {
        path: '/reuniones',
        element: <Reuniones />
      },
      {
        path: '/detalle-reunion/:id',
        element: <DetalleReunion />
      },
      {
        path: '/movfin',
        element: <Movfin/>
      },
      {
        path: '/tokens',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'presidenta']}>
            <Tokens />
          </ProtectedRoute>
        ),
      },
      {
        path: '/publicacion',
        element: <Publicacion />
      },
      {
        path: '/detalle-publicacion/:id',
        element: <DetallePublicacion />
      },

    ]
  },
  {
    path: '/auth',
    element: <Login />
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)