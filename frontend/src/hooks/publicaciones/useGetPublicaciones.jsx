import { useEffect, useState } from 'react';
import { getPublicaciones } from '@services/publicaciones.service.jsx';

const useGetPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);

  const fetchPublicaciones = async () => {
    const data = await getPublicaciones();
    setPublicaciones(data);
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  return { publicaciones, fetchPublicaciones, setPublicaciones };
};

export default useGetPublicaciones;
