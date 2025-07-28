import { useEffect, useState } from 'react';
import { deleteMovimiento, getMovimientos, updateMovimiento } from '../services/movimiento.service';
import { createMovimiento } from '../services/movimiento.service';
import useDeleteMovimiento from '../hooks/movimientos/useDeleteMovimiento.jsx';
import useUpdateMovimiento from '../hooks/movimientos/useEditMovimiento.jsx';
import { updateCuota } from '../services/cuotas.service.js';
import useMarcarCuotaPagada from '../hooks/cuotas/useUpdateStateCuota.jsx';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Calendar,
  BarChart3
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [marcarCuota, setMarcarCuota] = useState(false);
  const [rutVecino, setRutVecino] = useState("");
  const [idCuota, setIdCuota] = useState("");

  const { marcarCuotaPagada, loading: cuotaLoading, error: cuotaError } = useMarcarCuotaPagada();
  const { editarMovimiento, loading: loadingEdit } = useUpdateMovimiento();
  const { eliminarMovimiento, loading: loadingDelete } = useDeleteMovimiento();
  const { user } = useAuth();

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

  const fechaHoraLocal = () => {
    // Obtener fecha actual en zona horaria de Chile
    const ahora = new Date();
    const fechaChile = new Date(ahora.toLocaleString("en-US", {timeZone: "America/Santiago"}));
    return fechaChile.toISOString();
  };

  const formatearFecha = (iso) => {
    const fecha = new Date(iso);
    return fecha.toLocaleDateString('es-CL');
  }

  const formatearHora = (iso) => {
    const fecha = new Date(iso);
    return fecha.toLocaleTimeString('es-CL', {
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
        fecha_movimiento: fechaHoraLocal(),
      });

      if (marcarCuota && rutVecino.trim() !== "") {
        const resultado = await marcarCuotaPagada(rutVecino);
        if (resultado.success) {
          alert(`Movimiento creado y ${resultado.message}`);
        } else {
          alert(`Movimiento creado, pero hubo un error con la cuota: ${resultado.error}`);
        }
      } else if (marcarCuota) {
        alert("Para marcar la cuota, debe ingresar el RUT del vecino");
        return;
      } else {
        alert("Movimiento creado");
      }

      setNuevoMovimiento({ monto: '', descripcion: '', tipo_transaccion: 'ingreso' });
      setMostrarFormulario(false);
      setMarcarCuota(false);
      setRutVecino("");
      setIdCuota("");
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
        fechaActualizacion: fechaHoraLocal(),
      });
      alert("Movimiento modificado correctamente");
      setEditId(null);
      fetchMovimientos();
    } catch (error) {
      alert("Error al actualizar");
    }
  };

  const handleEliminarMovimiento = async (id) => {
    await eliminarMovimiento(id, () => {
      fetchMovimientos();
    });
  };

  // Cálculos financieros
  const totalIngresos = mov
    .filter(m => m.tipo_transaccion === 'ingreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresos = mov
    .filter(m => m.tipo_transaccion === 'egreso')
    .reduce((sum, m) => sum + m.monto, 0);

  const saldoFinal = totalIngresos - totalEgresos;

  // Preparar datos para el gráfico de evolución del balance
  const prepararDatosGrafico = () => {
    // Ordenar movimientos por fecha
    const movimientosOrdenados = [...mov]
      .filter(m => m && m.fecha_movimiento)
      .sort((a, b) => new Date(a.fecha_movimiento) - new Date(b.fecha_movimiento));

    let balanceAcumulado = 0;
    const datos = [];
    const etiquetas = [];

    movimientosOrdenados.forEach((movimiento, index) => {
      const monto = movimiento.tipo_transaccion === 'ingreso'
        ? movimiento.monto
        : -movimiento.monto;

      balanceAcumulado += monto;

      datos.push(balanceAcumulado);
      etiquetas.push(formatearFecha(movimiento.fecha_movimiento));
    });

    return { datos, etiquetas };
  };

  const { datos: datosGrafico, etiquetas: etiquetasGrafico } = prepararDatosGrafico();

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolución del balance a lo largo del tiempo',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return '$' + value.toLocaleString('es-CL');
          }
        }
      }
    }
  };

  const datosConfigGrafico = {
    labels: etiquetasGrafico,
    datasets: [
      {
        label: 'Balance Acumulado',
        data: datosGrafico,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const renderMovimientoCard = (item) => {
    if (!item || !item.id_movimiento) return null;
    const isEditing = editId === item.id_movimiento;
    const esIngreso = item.tipo_transaccion === 'ingreso';

    return (
      <div key={item.id_movimiento} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        {isEditing ? (
          <form className="space-y-4" onSubmit={handleGuardarEdicion}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto:</label>
                <input
                  type="number"
                  value={editFormData.monto}
                  onChange={e => setEditFormData({ ...editFormData, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo:</label>
                <select
                  value={editFormData.tipo_transaccion}
                  onChange={e => setEditFormData({ ...editFormData, tipo_transaccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
              <input
                type="text"
                value={editFormData.descripcion}
                onChange={e => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Check size={16} className="mr-1" />
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <X size={16} className="mr-1" />
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${esIngreso ? 'bg-green-100' : 'bg-red-100'}`}>
                {esIngreso ?
                  <TrendingUp className="text-green-600" size={24} /> :
                  <TrendingDown className="text-red-600" size={24} />
                }
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${esIngreso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {colocarMayus(item.tipo_transaccion)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className={`font-bold text-lg ${esIngreso ? 'text-green-600' : 'text-red-600'}`}>
                  ${item.monto.toLocaleString('es-CL')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descripción:</span>
                <span className="font-medium">{colocarMayus(item.descripcion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="text-sm text-gray-500">
                  {formatearFecha(item.fecha_movimiento)} - {formatearHora(item.fecha_movimiento)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                onClick={() => handleEditar(item)}
              >
                <Edit size={16} className="mr-1" />
                Editar
              </button>
              <button
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                onClick={() => handleEliminarMovimiento(item.id_movimiento)}
                disabled={loadingDelete}
              >
                <Trash2 size={16} className="mr-1" />
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-600">${totalIngresos.toLocaleString('es-CL')}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600">${totalEgresos.toLocaleString('es-CL')}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Final</p>
                <p className={`text-2xl font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${saldoFinal.toLocaleString('es-CL')}
                </p>
              </div>
              <div className={`p-3 rounded-full ${saldoFinal >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              <Plus size={20} className="mr-2" />
              {mostrarFormulario ? "Cancelar" : "Nuevo Movimiento"}
            </button>
          </div>
        </div>

        {/* Gráfico de Evolución del Balance */}
        {mov.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="text-green-600 mr-2" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Evolución del Balance</h2>
            </div>
            <div className="h-80">
              <Line data={datosConfigGrafico} options={opcionesGrafico} />
            </div>
          </div>
        )}

        {/* Formulario */}
        {mostrarFormulario && (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Movimiento</h2>
            <form onSubmit={handleCrearMovimiento} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto:</label>
                  <input
                    type="number"
                    value={nuevoMovimiento.monto}
                    onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, monto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo:</label>
                  <select
                    value={nuevoMovimiento.tipo_transaccion}
                    onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, tipo_transaccion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
                <input
                  type="text"
                  value={nuevoMovimiento.descripcion}
                  onChange={e => setNuevoMovimiento({ ...nuevoMovimiento, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={marcarCuota}
                  onChange={(e) => setMarcarCuota(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label className="text-sm font-medium text-gray-700">Pago de cuota</label>
              </div>

              {marcarCuota && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUT del Vecino:</label>
                  <input
                    type="text"
                    value={rutVecino}
                    onChange={(e) => setRutVecino(e.target.value)}
                    placeholder="Ej: 11.222.333-4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                <Check size={20} className="mr-2" />
                Guardar Movimiento
              </button>
            </form>
          </div>
        )}

        {/* Lista de Movimientos */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Movimientos</h2>
          {mov.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No hay movimientos registrados</p>
              <p className="text-gray-400">Crea un movimiento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mov.filter(item => item && item.id_movimiento).map(renderMovimientoCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Movimientos;