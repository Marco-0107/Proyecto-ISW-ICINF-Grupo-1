import Table from '@components/Table';
import Search from '@components/Search';
import ToastNotification from '@components/ToastNotification';
import ConfirmModal from '@components/ConfirmModal';
import { useState, useEffect } from 'react';
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
  const { cerrarToken } = useEditToken();
  const [idReunion, setIdReunion] = useState('');
  const [filter, setFilter] = useState('');
  const [idUsuario, setIdUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  const [confirmModal, setConfirmModal] = useState({
    isVisible: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const showConfirmModal = (title, message, onConfirm, type = 'warning') => {
    setConfirmModal({
      isVisible: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const hideConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isVisible: false }));
  };

  const handleConfirmAction = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    hideConfirmModal();
  };

  const fetchTokensAndHideToast = async () => {
    await fetchTokens();
    setTimeout(() => {
      hideToast();
    }, 2000);
  };

  // Obtener ID del usuario logeado por su RUT
  useEffect(() => {
    const obtenerIdUsuario = async () => {
      try {
        const { data } = await axios.get(`/user/detail/?rut=${user.rut}`, {
          headers: { "Cache-Control": "no-cache" }
        });
        setIdUsuario(data.data.id);
      } catch (error) {
      }
    };

    if (user.rut) {
      obtenerIdUsuario();
    }
  }, [user]);

  const handleCrear = async () => {
    if (!idReunion || !idUsuario) {
      showToast('Selecciona una reunión y asegúrate de que el usuario esté identificado', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const nuevo = await createToken(idUsuario, idReunion);
      setTokens([...tokens, nuevo]);
      setIdReunion('');
      showToast('✅ Token creado exitosamente', 'success');
      fetchTokensAndHideToast();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error al crear token', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: "ID", 
      field: "id_token", 
      width: 60,
      hozAlign: "center"
    },
    { 
      title: "Número", 
      field: "numero_token", 
      width: 100,
      hozAlign: "center",
      cssClass: "font-semibold"
    },
    { 
      title: "ID Reunión", 
      field: "Reunion.id_reunion", 
      width: 90,
      hozAlign: "center"
    },
    {
      title: "Objetivo",
      field: "Reunion.objetivo",
      width: 200,
      formatter: function (cell) {
        const objetivo = cell.getValue();
        return objetivo ? objetivo.substring(0, 50) + (objetivo.length > 50 ? "..." : "") : "—";
      }
    },
    {
      title: "Lugar",
      field: "Reunion.lugar",
      width: 150,
      formatter: function (cell) {
        const lugar = cell.getValue();
        return lugar ? lugar.substring(0, 30) + (lugar.length > 30 ? "..." : "") : "—";
      }
    },
    { 
      title: "Estado", 
      field: "estado", 
      width: 100,
      hozAlign: "center",
      formatter: function (cell) {
        const estado = cell.getValue();
        const span = document.createElement("span");
        span.textContent = estado;
        if (estado === "activo") {
          span.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
        } else {
          span.className = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800";
        }
        return span;
      }
    },
    {
      title: "Fecha de creación",
      field: "fecha_generacion",
      width: 160,
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
      width: 120,
      hozAlign: "center",
      formatter: function (cell) {
        const row = cell.getData();
        const button = document.createElement("button");

        if (row.estado === "activo") {
          button.textContent = "Cerrar";
          button.className = "bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm transition-colors";
          button.onclick = () => {
            showConfirmModal(
              "Cerrar Token",
              `¿Estás seguro de cerrar el token #${row.numero_token}? Esta acción no se puede deshacer.`,
              async () => {
                const result = await cerrarToken(row.id_token);
                if (result.success) {
                  showToast(result.message, 'success');
                  fetchTokensAndHideToast();
                } else {
                  showToast(result.message, 'error');
                }
              },
              'danger'
            );
          };
        } else {
          button.textContent = "Cerrado";
          button.disabled = true;
          button.className = "bg-gray-400 text-white font-semibold py-1 px-3 rounded text-sm cursor-not-allowed";
        }

        return button;
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tokens</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra los tokens de asistencia para las reuniones activas
          </p>
        </div>

        {/* Formulario de creación */}
        <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Nuevo Token</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reunión
              </label>
              <select 
                value={idReunion} 
                onChange={(e) => setIdReunion(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecciona reunión de hoy</option>
                {reuniones.map((reunion) => (
                  <option key={reunion.id_reunion} value={reunion.id_reunion}>
                    {`#${reunion.id_reunion} - ${reunion.objetivo}`}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleCrear}
              disabled={loading || !idReunion}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200 text-sm"
            >
              {loading ? 'Creando...' : 'Crear Token'}
            </button>
          </div>
        </div>

        {/* Tabla de tokens */}
        <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-green-800">
                Tokens Generados ({tokens.length})
              </h2>
              <div className="flex-shrink-0">
                <Search 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)} 
                  placeholder="Filtrar por número..." 
                  className="w-full sm:w-64 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table
              data={tokens}
              columns={columns}
              filter={filter}
              dataToFilter={'numero_token'}
              initialSortName={'fecha_generacion'}
            />
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-green-200 hover:border-green-300 transition-colors">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">✓</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Tokens Activos</h3>
                <p className="text-2xl font-bold text-green-600">
                  {tokens.filter(t => t.estado === 'activo').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-sm">×</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Tokens Cerrados</h3>
                <p className="text-2xl font-bold text-gray-600">
                  {tokens.filter(t => t.estado === 'cerrado').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-green-200 hover:border-green-300 transition-colors">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center border border-green-200">
                  <span className="text-green-700 font-semibold text-sm">#</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-800">Total Tokens</h3>
                <p className="text-2xl font-bold text-green-600">
                  {tokens.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={4000}
      />
      
      {/* Confirm Modal */}
      <ConfirmModal
        isVisible={confirmModal.isVisible}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmAction}
        onCancel={hideConfirmModal}
        type={confirmModal.type}
      />
    </div>
  );
};

export default Tokens;
