import { useState, useEffect } from 'react';
import { getUsers } from '@services/user.service.js';
import { useAuth } from '@context/AuthContext';

const useUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            const formattedData = response.map(user => ({
                nombre: user.nombre,
                apellido: user.apellido,
                rut: user.rut,
                email: user.email,
                rol: user.rol,
                telefono: user.telefono,
                createdAt: user.createdAt
            }));

            const rol = user?.rol?.toLowerCase();
            const rut = user?.rut;

            if (rol === "vecino"){
                const elUsuario = formattedData.filter(u => u.rut === rut);
                setUsers(elUsuario);
            } else {
                setUsers(formattedData);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const dataLogged = (formattedData) => {
        try {
            const { rut } = JSON.parse(sessionStorage.getItem('usuario'));
            for(let i = 0; i < formattedData.length ; i++) {
                if(formattedData[i].rut === rut) {
                    formattedData.splice(i, 1);
                    break;
                }
            }
        } catch (error) {
            console.error("Error: ", error)
        }
    };

    return { users, fetchUsers, setUsers };
};

export default useUsers;