import { useEffect, useState } from 'react';
import { getReuniones } from '@services/reunion.service';

const useGetReunionesActivas = () => {
  const [reuniones, setReuniones] = useState([]);

  const fetchReuniones = async () => {
    const todas = await getReuniones();

    const hoy = new Date().toISOString().split('T')[0];

    const reunionesActivas = todas.filter(r => r.fecha_reunion?.startsWith(hoy));
    setReuniones(reunionesActivas);
  };

  useEffect(() => {
    fetchReuniones();
  }, []);

  return { reuniones, fetchReuniones };
};

export default useGetReunionesActivas;
