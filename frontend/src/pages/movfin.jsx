import { useEffect, useState } from 'react';
import { deleteMovimiento, getMovimientos, updateMovimiento } from '../services/movimiento.service';
import { createMovimiento } from '../services/movimiento.service';
import useDeleteMovimiento from '../hooks/movimientos/useDeleteMovimiento.jsx';
import useUpdateMovimiento from '../hooks/movimientos/useEditMovimiento.jsx';
import { useAuth } from '../context/AuthContext';
import '@styles/movfin.css';

const Movimientos = () => {
  const [mov, setMovimientos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    monto: '',
    descripcion: '',
    fecha_movimiento: '',
    tipo_transaccion: 'ingreso',
  });

  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const { editarMovimiento, loading: loadingEdit } = useUpdateMovimiento();
  const { eliminarMovimiento, loading: loadingDelete } = useDeleteMovimiento();
  const { user } = useAuth;

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    try {
      const data = await getMovimientos();

      console.log("Datos del backend:", data);

      setMovimientos(data);

    } catch (error) {
      console.log("No se pudieron cargar los movimientos");
    }
  };

  const formatearFecha = iso => new Date(iso).toLocaleDateString('es-CL');
  const formatearHora = date => {
    const adj = new Date(date);
    adj.setHours(adj.getHours() - 4);
    return adj.toLocaleTimeString('es-CL', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleCrearMovimiento = async (e) => {
    e.preventDefault();

    try {
      await createMovimiento({
        monto: parseFloat(nuevoMovimiento.monto),
        descripcion: nuevoMovimiento.descripcion,
        tipo_transaccion: nuevoMovimiento.tipo_transaccion,
        fecha_movimiento: new Date().toISOString(),
      });

      alert("Movimiento creado");
      setNuevoMovimiento({ monto: '', descripcion: '', tipo_transaccion: 'ingreso' });
      setMostrarFormulario(false);
      fetchMovimientos();
    } catch (error) {
      console.error("Error completo:", error)
      alert("Error al crear el movimiento");
    }
  }

  const handleEditar = (item) => {
    console.log("Editando", item);
    setEditId(item.id_movimiento);
    setEditFormData({
      monto: item.monto,
      descripcion: item.descripcion,
      tipo_transaccion: item.tipo_transaccion,
    });
  };

  function colocarMayus(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }


  const handleGuardarEdicion = async e => {
    e.preventDefault();

    try {
      await updateMovimiento(editId, {
        monto: parseFloat(editFormData.monto),
        descripcion: editFormData.descripcion,
        tipo_transaccion: editFormData.tipo_transaccion,
        fechaActualizacion: new Date().toISOString(),
      });
      alert("Movimiento modificado correctamente");
      setEditId(null);
      fetchMovimientos();
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  const totalIngresos = mov
    .filter(m => m.tipo_transaccion === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresos = mov
    .filter(m => m.tipo_transaccion === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const saldoFinal = totalIngresos - totalEgresos;

  const renderMovimientoCard = (item) => {
    if (!item || !item.id_movimiento) return null;
    const isEditing = editId === item.id_movimiento;

    return (
      <div className='bg-gray-50 p-6 rounded-lg w-full '>
        <div key={item.id_movimiento} className="movimiento-card bg-gray-100 p-4 rounded border shadow mb-4 w-full md:w-1/2">
          {isEditing ? (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-1" onSubmit={handleGuardarEdicion}>
              <label>Monto:</label>
              <input
                type="number"
                value={editFormData.monto}
                onChange={e => setEditFormData({ ...editFormData, monto: e.target.value })}
                required
              />
              <label>Descripción:</label>
              <input
                type="text"
                value={editFormData.descripcion}
                onChange={e => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                required
              />
              <label>Tipo:</label>
              <select
                value={editFormData.tipo_transaccion}
                onChange={e => setEditFormData({ ...editFormData, tipo_transaccion: e.target.value })}
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
              <div>
                <button type="submit" className='bg-blue-600 text-white px-2 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400'>Guardar</button>
                <button type="button" onClick={() => setEditId(null)} className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400'>Cancelar</button>
              </div>
            </form>
          ) : (

            <>
              <p><strong>Monto:</strong> {item.monto.toLocaleString('es-CL')}</p>
              <p><strong>Tipo:</strong> {colocarMayus(item.tipo_transaccion)}</p>
              <p><strong>Descripción:</strong> {colocarMayus(item.descripcion)}</p>
              <p><strong>Fecha:</strong> {formatearFecha(item.fecha_movimiento)} - {formatearHora(item.fecha_movimiento)}</p>
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded"
                onClick={() => handleEditar(item)}>Editar</button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
                onClick={() => eliminarMovimiento(item.id_movimiento)}
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="movfin-page">
      {mov.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        mov.filter(item => item && item.id_movimiento).map(renderMovimientoCard)
      )}

      <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="mb-2 text-sm font-semibold text-blue-600 hover:underline">
        {mostrarFormulario ? "Cancelar" : "Nuevo movimiento"}
      </button>

      {mostrarFormulario && (
        <form onSubmit={handleCrearMovimiento}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Monto:</label>
            <input type="number" value={nuevoMovimiento.monto} onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, monto: e.target.value })} required />
          </div>
          <label className="block text-sm font-medium text-gray-700">Descripción:</label>
          <input
            type="text"
            value={nuevoMovimiento.descripcion}
            onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, descripcion: e.target.value })}
            required
          />

          <label>Tipo:</label>
          <select
            value={nuevoMovimiento.tipo_transaccion}
            onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, tipo_transaccion: e.target.value })}
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
          <button type="submit" className='bg-blue-600 text-white px-4 py-2 rounded'>Guardar Movimiento</button>
        </form>
      )}

      <div className="px-6 py-1 bg-gray-50 w-1/2 max-w-md min-h-fit">
        <p><strong>Total Ingresos:</strong> ${totalIngresos.toLocaleString('es-CL')}</p>
        <p><strong>Total Egresos:</strong> ${totalEgresos.toLocaleString('es-CL')}</p>
        <p><strong>Saldo Final:</strong> ${saldoFinal.toLocaleString('es-CL')}</p>
      </div>
    </div>
  );
}
export default Movimientos;