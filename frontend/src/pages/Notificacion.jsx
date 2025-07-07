import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createNotificacion } from '@services/notificaciones.service';

export default function NotificacionForm() {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'ALERTA'
  });
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
    e.preventDefault();
    createNotificacion(form).then(() => navigate('/home'));
  };

  return (
    <div className="container mx-auto max-w-xl py-6">
      <h2 className="text-xl font-semibold mb-4">Nuevo anuncio</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          rows="4"
          value={form.descripcion}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Publicar
        </button>
      </form>
    </div>
  );
}
