import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createPublicacion } from '@services/publicaciones.service';

export default function PublicacionForm() {
  const [form, setForm] = useState({
    titulo: '',
    contenido: '',
    imagen: '',
    tipo: 'NOTICIA'
  });
  const navigate = useNavigate();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    createPublicacion(form).then(() => navigate('/home'));
  };

  return (
    <div className="container mx-auto max-w-xl py-6">
      <h2 className="text-xl font-semibold mb-4">Nueva noticia</h2>
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
          name="contenido"
          placeholder="Contenido"
          rows="6"
          value={form.contenido}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <input
          name="imagen"
          placeholder="URL imagen (opcional)"
          value={form.imagen}
          onChange={handleChange}
          className="w-full border p-2"
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Publicar
        </button>
      </form>
    </div>
  );
}
