import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import axios from '@services/root.service';
import '@styles/reuniones.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = ['ADMIN', 'PRESIDENTE'].includes(user?.rol?.toUpperCase());

  // Estado publicaciones
  const [publicaciones, setPublicaciones] = useState([]);
  const [showPubForm, setShowPubForm] = useState(false);
  const [pubForm, setPubForm] = useState({
    titulo: '',
    tipo: '',
    contenido: '',
    estado: 'pendiente',
  });

  // Estado notificaciones
  const [notificaciones, setNotificaciones] = useState([]);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'ALERTA',
  });

  useEffect(() => {
    fetchPublicaciones();
    fetchNotificaciones();
  }, []);

  const fetchPublicaciones = async () => {
    try {
      const { data } = await axios.get('/publicacion');
      setPublicaciones(data.data);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    }
  };

  const fetchNotificaciones = async () => {
    try {
      const { data } = await axios.get('/notificacion');
      setNotificaciones(data.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  const handlePubInput = e => {
    const { name, value } = e.target;
    setPubForm(f => ({ ...f, [name]: value }));
  };

  const submitPub = async e => {
    e.preventDefault();
    if (!pubForm.titulo.trim()) return alert('El título es obligatorio');
    try {
      await axios.post('/publicacion', pubForm);
      alert('¡Publicación creada!');
      setShowPubForm(false);
      setPubForm({ titulo: '', tipo: '', contenido: '', estado: 'pendiente' });
      fetchPublicaciones();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || 'Error creando publicación');
    }
  };

  const handleNotifInput = e => {
    const { name, value } = e.target;
    setNotifForm(f => ({ ...f, [name]: value }));
  };

  const submitNotif = async e => {
    e.preventDefault();
    if (notifForm.descripcion.trim().length < 10) return alert('La descripción debe tener al menos 10 caracteres');
    try {
      await axios.post('/notificacion', notifForm);
      alert('Notificación creada');
      setShowNotifForm(false);
      setNotifForm({ titulo: '', descripcion: '', tipo: 'ALERTA' });
      fetchNotificaciones();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.details || 'Error creando notificación');
    }
  };

  return (
    <div className="home-page flex bg-white min-h-screen">
      {/* Sidebar Notificaciones */}
      <aside className="w-1/4 bg-gray-50 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notificaciones</h2>
          {isAdmin && (
            <button
              onClick={() => setShowNotifForm(v => !v)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
            >
              {showNotifForm ? 'Cerrar' : '+ Nueva'}
            </button>
          )}
        </div>

        {showNotifForm && (
          <form onSubmit={submitNotif} className="space-y-3 mb-6">
            <input
              name="titulo"
              value={notifForm.titulo}
              onChange={handleNotifInput}
              placeholder="Título"
              className="w-full border p-2 rounded text-sm"
              required
            />
            <textarea
              name="descripcion"
              value={notifForm.descripcion}
              onChange={handleNotifInput}
              placeholder="Descripción"
              rows={2}
              className="w-full border p-2 rounded text-sm"
              required
            />
            <select
              name="tipo"
              value={notifForm.tipo}
              onChange={handleNotifInput}
              className="w-full border p-2 rounded text-sm"
            >
              <option value="ALERTA">Alerta</option>
              <option value="NOTIFICACION">Notificación</option>
              <option value="OTROS">Otros</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm">
              Crear notificación
            </button>
          </form>
        )}

        <div className="space-y-4">
          {notificaciones.map(n => (
            <div key={n.id_notificacion} className="border p-3 rounded shadow-sm">
              <h3 className="font-semibold text-sm">{n.titulo}</h3>
              <p className="text-xs mb-2">{n.descripcion}</p>
              <button
                onClick={() => navigate(`/detalle-notificacion/${n.id_notificacion}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                Ver detalle
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Contenido Publicaciones */}
      <main className="w-3/4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Publicaciones</h2>
          {isAdmin && (
            <button
              onClick={() => setShowPubForm(v => !v)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {showPubForm ? 'Cancelar' : '+ Nueva publicación'}
            </button>
          )}
        </div>

        {showPubForm && (
          <form onSubmit={submitPub} className="space-y-4 mb-8">
            <input
              name="titulo"
              value={pubForm.titulo}
              onChange={handlePubInput}
              placeholder="Título"
              className="w-full border p-3 rounded"
              required
            />
            <input
              name="tipo"
              value={pubForm.tipo}
              onChange={handlePubInput}
              placeholder="Tipo"
              className="w-full border p-3 rounded"
            />
            <textarea
              name="contenido"
              value={pubForm.contenido}
              onChange={handlePubInput}
              placeholder="Contenido"
              rows={5}
              className="w-full border p-3 rounded"
              required
            />
            <select
              name="estado"
              value={pubForm.estado}
              onChange={handlePubInput}
              className="w-full border p-3 rounded"
            >
              <option value="pendiente">Pendiente</option>
              <option value="publicada">Publicada</option>
            </select>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
              Crear publicación
            </button>
          </form>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {publicaciones.map(p => (
            <div key={p.id_publicacion} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition p-4">
              <h3 className="text-xl font-semibold mb-2">{p.titulo}</h3>
              <p className="text-sm mb-4">{p.tipo}</p>
              <button
                onClick={() => navigate(`/detalle-publicacion/${p.id_publicacion}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Ver detalle publicación
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}