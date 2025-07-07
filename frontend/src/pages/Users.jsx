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
import UpdateIconDisablecopy from '../assets/updateIconDisabledcopy.svg';
import { useCallback, useState, useEffect } from 'react';
import '@styles/users.css';
import useEditUser from '@hooks/users/useEditUser';
import { createUser } from '../services/user.service';
import useDeleteUser from '@hooks/users/useDeleteUser';
import { showErrorAlert, showSuccessAlert } from '../helpers/sweetAlert';
import { Navigate } from 'react-router-dom';
import { Form } from 'react-hook-form';
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

  const [ dataForm, setdataForm ] = useState({
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
  
  const [ 
    isCreatePopupOpen,
    setIsCreatePopupOpen
   ] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setdataForm((prev) => ({
      ...prev,
      [name]: value
    }));
    };

  const handleCreate = async (dataForm) => {
    console.log("Datos enviados al backend:", dataForm);

    try{
      const response = await createUser(dataForm);
      console.log("Respuesta completa:", response);
      console.log("Status devuelto:", response.data?.status);
      if (response.data?.status === 'Success')  {
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
    { title: "Apellido", field: "apellido", width: 350, responsive: 0},
    { title: "Correo electrónico", field: "email", width: 300, responsive: 3 },
    { title: "Rut", field: "rut", width: 150, responsive: 2 },
    { title: "Rol", field: "rol", width: 200, responsive: 2 },
    { title: "Teléfono", field: "telefono", width: 350, responsive: 2},
    { title: "Creado", field: "createdAt", width: 200, responsive: 2 }
  ];

  return (
    <div className='main-container'>
      <div className='table-container'>
        <div className='top-table'>
          <h1 className='title-table'>Usuarios</h1>
          <div className='filter-actions'>
            <Search value={filterRut} onChange={handleRutFilterChange} placeholder={'Filtrar por rut'} />
            
            <button onClick={handleClickUpdate} disabled={dataUser.length === 0}>
              {dataUser.length === 0 ? (
                <img src={UpdateIconDisable} alt="edit-disabled" />
              ) : (
                <img src={UpdateIcon} alt="edit" />
              )}
            </button>
            <button className='delete-user-button' disabled={dataUser.length === 0} onClick={() => handleDelete(dataUser)}>
              {dataUser.length === 0 ? (
                <img src={DeleteIconDisable} alt="delete-disabled" />
              ) : (
                <img src={DeleteIcon} alt="delete" />
              )}
            </button>
            <button onClick={handleClickCreate}>
                <img src={UpdateIconcopy} alt="crear usuario"/>
            </button>
          </div>
        </div>
        <Table
          data={users}
          columns={columns}
          filter={filterRut}
          dataToFilter={'rut'}
          initialSortName={'nombre'}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <Popup show={isPopupOpen} setShow={setIsPopupOpen} data={dataUser} action={handleUpdate} />
      <CreatePopUp show={isCreatePopupOpen} setShow={setIsCreatePopupOpen} data={dataUser} action={handleCreate}/>
      </div>
  );
};

export default Users;