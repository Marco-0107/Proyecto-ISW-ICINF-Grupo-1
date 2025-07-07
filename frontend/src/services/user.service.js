import axios from './root.service.js';
import { formatUserData } from '@helpers/formatData.js';
import { convertirMinusculas } from '../helpers/formatData.js';

export async function getUsers() {
    try {
        const { data } = await axios.get('/user/');
        const formattedData = data.data.map(formatUserData);
        return formattedData;
    } catch (error) {
        return error.response.data;
    }
}

//Crear usuario
export async function createUser(dataUser) {
    try{
        const dataCreate = convertirMinusculas(dataUser);
        const { nombre, apellido, direccion, rut, telefono, email, password, rol, estado_activo} = dataCreate
        const response = await axios.post('/user', 
            {
            nombre,
            apellido,
            rut,
            direccion,
            telefono,
            password,
            email,
            rol,
            estado_activo
        });
        return response;
    } catch (error) {
        return error.response;
    }
}

export async function updateUser(data, rut, userLogeado) {
    try {
        console.log(data);
        const response = await axios.patch(`/user/detail/?rut=${rut}`, data);
        const usuarioActualizado = response.data.data;
        console.log("Usuario actualizado: ", usuarioActualizado);

        if (userLogeado?.rut === rut) {
            const nuevoUsuario = {
                ...userLogeado,
                ...usuarioActualizado
            };
            sessionStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
            console.log("sessionStorage actualizado");
        }
        return usuarioActualizado;
    } catch (error) {
        console.log("Error: ", error.response?.data || error.message);
        return error.response?.data || { error: "error desconocido" };
    }
}

export async function deleteUser(rut) {
    try {
        const response = await axios.delete(`/user/detail/?rut=${rut}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
}