import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import '@styles/reuniones.css';

const Reuniones = () => {
  const [reuniones, setReuniones] = useState([]);
  const { user } = useAuth();

  const hoy = new Date().toISOString().split('T')[0];

  const futuras = reuniones.filter(r => r.fecha_reunion > hoy);
  const actuales = reuniones.filter(r => r.fecha_reunion.startsWith(hoy));
  const pasadas = reuniones.filter(r => r.fecha_reunion < hoy);

  const renderReunionCard = (reunion) => (
    <div key={reunion.id_reunion} className="reunion-card">
      <div className="reunion-info">
        <p><strong>Lugar:</strong> {reunion.lugar}</p>
        <p><strong>Fecha:</strong> {reunion.fecha_reunion.slice(0, 10)}</p>
        <p><strong>Objetivo:</strong> {reunion.objetivo}</p>
      </div>
      <div className="reunion-botones">
        <button>Ver detalle</button>
        {(user?.rol === 'presidenta' || user?.rol === 'admin') && (
          <>
            <button>Editar</button>
            <button className="btn-delete">Eliminar</button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="reuniones-page">
      <h1>Reuniones</h1>

      {(user?.rol === 'presidenta' || user?.rol === 'admin') && (
        <div className="crear-reunion-container">
          <button className="btn-crear">+ Crear nueva reunión</button>
        </div>
      )}

      <div className="seccion-reuniones">
        <h2>Futuras</h2>
        {futuras.map(renderReunionCard)}
      </div>

      <div className="seccion-reuniones">
        <h2>Actuales</h2>
        {actuales.map(renderReunionCard)}
      </div>

      <div className="seccion-reuniones">
        <h2>Pasadas</h2>
        {pasadas.map(renderReunionCard)}
      </div>
    </div>
  );
};

export default Reuniones;