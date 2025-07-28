import { useEffect, useState } from 'react';
import { getNotificaciones } from '@services/notificaciones.service.js';

const useGetNotificaciones = () => {
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
