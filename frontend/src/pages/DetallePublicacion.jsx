import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicacionById } from '@services/publicaciones.service';
import '@styles/reuniones.css';
export default function PublicacionDetalle() {
  const { id } = useParams();
  const [pub, setPub] = useState(null);

  useEffect(() => {
    getPublicacionById(id).then(setPub);
  }, [id]);

  if (!pub) return <p>Cargando…</p>;

  return (
    <div className="container mx-auto max-w-2xl py-6 space-y-4 bg-white">
      <h1 className="text-3xl font-bold">{pub.titulo}</h1>
      {pub.imagen && (
        <img src={pub.imagen} alt={pub.titulo} className="w-full" />
      )}
      <p className="text-sm text-gray-500">
        Publicado: {new Date(pub.fecha_publicacion).toLocaleDateString()}
      </p>
      <article className="prose" dangerouslySetInnerHTML={{ __html: pub.contenido }} />
    </div>
  );
}
