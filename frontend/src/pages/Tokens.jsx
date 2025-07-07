import Table from '@components/Table';
import Search from '@components/Search';
import { useState, useEffect } from 'react';
import '@styles/users.css';
import useGetTokens from '@hooks/tokenss/useGetTokens';
import useEditToken from '@hooks/tokenss/useEditToken';
import { createToken } from '@services/tokens.service';
import useGetReunionesActivas from '@hooks/reuniones/useGetReunionesActivas';
import { useAuth } from '@context/AuthContext';
import axios from '@services/root.service';

const Tokens = () => {
  const { tokens, fetchTokens, setTokens } = useGetTokens();
  const { reuniones } = useGetReunionesActivas();
  const { user } = useAuth();
  const { cerrarToken } = useEditToken(fetchTokens);

  const [idReunion, setIdReunion] = useState('');
  const [filter, setFilter] = useState('');
  const [idUsuario, setIdUsuario] = useState(null);

  // Obtener ID del usuario logeado por su RUT
  useEffect(() => {
    const obtenerIdUsuario = async () => {
      try {
        const { data } = await axios.get(`/user/detail/?rut=${user.rut}`, {
          headers: { "Cache-Control": "no-cache" }
        });
        setIdUsuario(data.data.id);
      } catch (error) {
        console.error("Error al obtener ID del usuario:", error);
      }
    };

    if (user.rut) {
      obtenerIdUsuario();
    }
  }, [user]);

  const handleCrear = async () => {
    if (!idReunion || !idUsuario) {
      alert('Selecciona una reunión y asegúrate de que el usuario esté identificado');
      return;
    }
    try {
      const nuevo = await createToken(idUsuario, idReunion);
      setTokens([...tokens, nuevo]);
      setIdReunion('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear token');
    }
  };

  const columns = [
    { title: "ID", field: "id_token", width: 80 },
    { title: "Número", field: "numero_token", width: 120 },
    { title: "ID Reunión", field: "Reunion.id_reunion", width: 120 },
    { title: "Estado", field: "estado", width: 100 },
    {
      title: "Fecha de creación",
      field: "fecha_generacion",
      width: 200,
      formatter: function (cell) {
        const fecha = new Date(cell.getValue());
        return fecha.toLocaleString("es-CL", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      }
    },
    {
      title: "Acciones",
      field: "acciones",
      width: 150,
      hozAlign: "center",
      formatter: function (cell) {
        const row = cell.getData();
        const button = document.createElement("button");

        if (row.estado === "activo") {
          button.textContent = "Cerrar";
          button.className = "boton-cerrar";
          button.onclick = () => {
            const confirmar = window.confirm(`¿Estás seguro de cerrar el token #${row.numero_token}?`);
            if (confirmar) cerrarToken(row.id_token);
          };
        } else {
          button.textContent = "Cerrado";
          button.disabled = true;
          button.className = "boton-cerrar-disabled";
        }

        return button;
      }
    }
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Tokens Generados</h1>
          <div className='filter-actions'>
            <Search value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={'Filtrar por número'} />
            <select value={idReunion} onChange={(e) => setIdReunion(e.target.value)}>
              <option value="">Selecciona reunión de hoy</option>
              {reuniones.map((reunion) => (
                <option key={reunion.id_reunion} value={reunion.id_reunion}>
                  {`#${reunion.id_reunion} - ${reunion.objetivo}`}
                </option>
              ))}
            </select>
            <button onClick={handleCrear}>Crear Token</button>
          </div>
        </div>
        <Table
          data={tokens}
          columns={columns}
          filter={filter}
          dataToFilter={'numero_token'}
          initialSortName={'fecha_generacion'}
        />
      </div>
    </div>
  );
};

export default Tokens;
