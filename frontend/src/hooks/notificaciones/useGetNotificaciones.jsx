import { useEffect, useState } from 'react';
import { getNotificaciones } from '@services/notificaciones.service.jsx';

const useGetPublicaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  const fetchNotificaciones = async () => {
    const data = await getNotificaciones();
    setNotificaciones(data);
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  return { notificaciones, fetchNotificaciones, setNotificaciones };
};

export default useGetNotificaciones;
