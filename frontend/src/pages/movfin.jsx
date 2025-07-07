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
    return adj.toLocaleDateString('es-CL', {
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
      alert("Error al crear usuario");
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
      <div key={item.id_movimiento} className="movimiento-card">
        {isEditing ? (
          <form className="edit-movimiento-form" onSubmit={handleGuardarEdicion}>
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
            <div className="edit-form-buttons">
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
            </div>
          </form>
        ) : (

          <>
            <p><strong>Monto:</strong> {item.monto}</p>
            <p><strong>Tipo:</strong> {item.tipo_transaccion}</p>
            <p><strong>Descripción:</strong> {item.descripcion}</p>
            <p><strong>Fecha:</strong> {formatearFecha(item.fecha_movimiento)} {formatearHora(item.fecha_movimiento)}</p>
            <button onClick={() => handleEditar(item)}>Editar</button>
            <button
              className="btn-delete"
              onClick={() => eliminarMovimiento(item.id_movimiento)}
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="movfin-page">
      <h1>Movimientos Financieros</h1>

      {mov.length === 0 ? (
        <p>No hay movimientos registrados.</p>
      ) : (
        mov.filter(item => item && item.id_movimiento).map(renderMovimientoCard)
      )}

      <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
        {mostrarFormulario ? "Cancelar" : "Nuevo movimiento"}
      </button>

      {mostrarFormulario && (
        <form onSubmit={handleCrearMovimiento}>
          <label>Monto:</label>
          <input
            type="number"
            value={nuevoMovimiento.monto}
            onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, monto: e.target.value })}
            required
          />

          <label>Descripción:</label>
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

          <button type="submit">Guardar Movimiento</button>
        </form>
      )}

      <div className="resumen-financiero">
        <p><strong>Total Ingresos:</strong> ${totalIngresos.toLocaleString()}</p>
        <p><strong>Total Egresos:</strong> ${totalEgresos.toLocaleString()}</p>
        <p><strong>Saldo Final:</strong> ${saldoFinal.toLocaleString()}</p>
      </div>
    </div>
  );
}
export default Movimientos;

