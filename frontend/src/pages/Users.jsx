import Table from '@components/Table';
import useUsers from '@hooks/users/useGetUsers.jsx';
import Search from '../components/Search';
import Popup from '../components/Popup';
import CreatePopUp from '../components/CreatePopUp';
import DeleteIcon from '../assets/deleteIcon.svg';
import UpdateIcon from '../assets/updateIcon.svg';
import UpdateIconcopy from '../assets/updateIconcopy.svg';
import UpdateIconDisable from '../assets/updateIconDisabled.svg';
import DeleteIconDisable from '../assets/deleteIconDisabled.svg';
import { useCallback, useState } from 'react';
import useEditUser from '@hooks/users/useEditUser';
import { createUser } from '../services/user.service';
import useDeleteUser from '@hooks/users/useDeleteUser';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const { users, fetchUsers, setUsers } = useUsers();
  const [filterRut, setFilterRut] = useState('');

  const {
    handleClickUpdate,
    handleUpdate,
    isPopupOpen,
    setIsPopupOpen,
    dataUser,
    setDataUser
  } = useEditUser(setUsers);

  const { handleDelete } = useDeleteUser(fetchUsers, setDataUser);

  const handleRutFilterChange = (e) => {
    setFilterRut(e.target.value);
  };

  const handleSelectionChange = useCallback((selectedUsers) => {
    setDataUser(selectedUsers);
  }, [setDataUser]);

  const [dataForm, setdataForm] = useState({
    nombre: "",
    apellido: "",
    rut: "",
    direccion: "",
    email: "",
    password: "",
    telefono: "",
    rol: "vecino",
    estado_activo: true
  });

  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);

  const handleClickCreate = () => {
    setIsCreatePopupOpen(true);
    setdataForm({
      nombre: "",
      apellido: "",
      rut: "",
      direccion: "",
      email: "",
      password: "",
      telefono: "",
      rol: "vecino",
      estado_activo: true
    })
  };

  const handleCreate = async (dataForm) => {
    console.log("Datos enviados al backend:", dataForm);

    try {
      const response = await createUser(dataForm);
      console.log("Respuesta completa:", response);
      console.log("Status devuelto:", response.data?.status);
      if (response.data?.status === 'Success') {
        showSuccessAlert('Creado', 'Usuario creado correctamente.');
        setTimeout(() => {
          Navigate();
        }, 3000)
      } else if (response.data?.status === 'Client error') {
        showErrorAlert('Error', response.data?.details || 'Error en la solicitud.');
        console.log("Error al registrar usuario:", response.data);
      }
    } catch (error) {
      console.log("Error al registrar un usuario: ", error);
      showErrorAlert('Cancelado', 'Ocurrió un error al crear.');
    }
  }

  const columns = [
    { title: "Nombre", field: "nombre", width: 350, responsive: 0 },
    { title: "Apellido", field: "apellido", width: 350, responsive: 0 },
    { title: "Correo electrónico", field: "email", width: 300, responsive: 3 },
    { title: "Rut", field: "rut", width: 150, responsive: 2 },
    { title: "Rol", field: "rol", width: 200, responsive: 2 },
    { title: "Teléfono", field: "telefono", width: 350, responsive: 2 },
    { title: "Creado", field: "createdAt", width: 200, responsive: 2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          {/* Filtros y Acciones */}
          <div className="p-6 bg-gray-50/50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              {/* Sección de búsqueda */}
              <div className="flex-1 lg:max-w-md">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Search
                    value={filterRut}
                    onChange={handleRutFilterChange}
                    placeholder="Buscar por RUT..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Botón Editar */}
                <button
                  onClick={handleClickUpdate}
                  disabled={dataUser.length === 0}
                  className={`
                    inline-flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg
                    ${dataUser.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-blue-500/25 active:scale-95'
                    }
                  `}
                  title="Editar usuario seleccionado"
                >
                  <img
                    src={dataUser.length === 0 ? UpdateIconDisable : UpdateIcon}
                    alt="edit"
                    className="w-5 h-5 mr-2"
                  />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                {/* Botón Eliminar */}
                {["presidenta", "admin", "tesorera", "secretario"].includes(user?.rol?.toLowerCase()) && (
                  <button
                    disabled={dataUser.length === 0}
                    onClick={() => handleDelete(dataUser)}
                    className={`
                    inline-flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg
                    ${dataUser.length === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/25 active:scale-95'
                      }
                  `}
                    title="Eliminar usuario seleccionado"
                  >
                    <img
                      src={dataUser.length === 0 ? DeleteIconDisable : DeleteIcon}
                      alt="delete"
                      className="w-5 h-5 mr-2"
                    />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                )}

                {/* Botón Crear */}
                <button
                  onClick={handleClickCreate}
                  className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 active:scale-95"
                  title="Crear nuevo usuario"
                >
                  <img src={UpdateIconcopy} alt="crear" className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Nuevo Usuario</span>
                </button>
              </div>
            </div>

            {/* Información de selección */}
            {dataUser.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">
                    {dataUser.length} usuario{dataUser.length > 1 ? 's' : ''} seleccionado{dataUser.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          {/* Contenedor de la tabla con scroll horizontal */}
          <div className="overflow-x-auto">
            <Table
              data={users}
              columns={columns}
              filter={filterRut}
              dataToFilter={'rut'}
              initialSortName={'nombre'}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          {/* Footer de la tabla */}
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Mostrando {users.length} usuarios</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Actualizado: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estados de carga o vacío */}
        {users.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p className="text-gray-500 mb-6">Comienza creando tu primer usuario</p>
            <button
              onClick={handleClickCreate}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            >
              <img src={UpdateIconcopy} alt="crear" className="w-5 h-5 mr-2" />
              Crear primer usuario
            </button>
          </div>
        )}
      </div>

      {/* Popups */}
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} action={handleUpdate} />
      <CreatePopUp show={isCreatePopupOpen} setShow={setIsCreatePopupOpen} data={dataUser} action={handleCreate} />
    </div>
  );
};

export default Users;