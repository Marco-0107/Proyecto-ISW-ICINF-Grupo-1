import { useEffect, useState } from 'react';
import { getReuniones } from '@services/reunion.service.jsx';

const useGetReuniones = () => {
  const [reuniones, setReuniones] = useState([]);

  const fetchReuniones = async () => {
    const data = await getReuniones();
    setReuniones(data);
  };

  useEffect(() => {
    fetchReuniones();
  }, []);

  return { reuniones, fetchReuniones, setReuniones };
};

export default useGetReuniones;
