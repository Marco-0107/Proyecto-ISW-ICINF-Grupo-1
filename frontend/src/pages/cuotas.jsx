import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCuota, createCuota, getCuotasUsuario, getCuotasUsuarioByRut, deleteCuota } from '../services/cuotas.service';
import useDeleteCuota from '../hooks/cuotas/useDeleteCuota';
import useUpdateCuota from '../hooks/cuotas/useEditCuota';

const Cuotas = () => {
    const { user } = useAuth();
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editID, setEditID] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [nuevaCuota, setNuevaCuota] = useState({
        monto_c: ''
    });

    useEffect(() => {
        console.log("Usuario logueado:", user);
        fetchCuotas();
    }, []);

    const fetchCuotas = async () => {
        setLoading(true);
        try {
            if (user?.rol === 'vecino') {
                const data = await getCuotasUsuarioByRut(user.rut);
                console.log("Cuotas del usuario:", data);
                setCuotas(data);
            } else {
                const data = await getCuota();
                console.log("Todas las cuotas: ", data);
                setCuotas(data);
            }
        } catch (error) {
            console.log("No se pudieron cargar las cuotas.");
        }
        setLoading(false);
    };

    const handleCrearCuota = async (e) => {
        e.preventDefault();

        try {
            await createCuota({
                monto_c: parseFloat(nuevaCuota.monto_c)
            });

            alert("Cuota creada correctamente");
            setNuevaCuota({ monto_c: '' });
            setMostrarFormulario(false);
            fetchCuotas();
        } catch (error) {
            console.log("Error completo:", error)
            alert("Error al crear la cuota");
        }
    };

    return (
        <>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Cuotas</h1>
                {user?.rol === 'vecino' ? (
                    <p>Aquí puedes ver tus cuotas asignadas y su estado de pago.</p>
                ) : (
                    <p>Gestión de cuotas vecinales. Recuerde adjuntar comprobantes a tiempo.</p>
                )}
                {loading ? (
                    <p>Cargando cuotas...</p>
                ) : cuotas.length > 0 ? (
                    <ul className="space-y-2">
    {cuotas.map((cuota) => (
        <li key={cuota.id_cuota} className="bg-white p-4 border rounded">
            <p><strong>Fecha de Emisión:</strong> {cuota.fecha_emision}</p>
            <p><strong>Fecha de Actualización:</strong> {cuota.fechaActualizacion}</p>
            <p><strong>Monto:</strong> ${cuota.monto_c.toLocaleString("es-CL")}</p>
            <p><strong>Estado: </strong>{cuota.estado}</p>

            {user?.rol === 'vecino' && (
                <p>
                    <strong>Estado de Pago: </strong>
                    <span className={cuota.estado_pago ? "text-green-600" : "text-red-600"}>
                        {cuota.estado_pago ? "Pagada" : "Pendiente"}
                    </span>
                </p>
            )}

            <button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded"
                onClick={() => deleteCuota(cuota.id_cuota)}
            >
                Eliminar
            </button>
        </li>
    ))}
</ul>
                ) : (
                    <p>No hay cuotas registradas</p>
                )}
            </div>

            {/* Solo mostrar el formulario de creacion si el usuario tiene los permisos correspondientes */}
            {(user?.rol === 'admin' || user?.rol === 'presidenta' || user?.rol === 'tesorera') && (
                <div className='p-6'>
                    <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="mb-2 text-sm font-semibold text-blue-600 hover:underline">
                        {mostrarFormulario ? "Cancelar" : "Crear cuota"}
                    </button>

                    {mostrarFormulario && (
                        <form onSubmit={handleCrearCuota} className="md:col-span-2">
                            <label className="block mb-2">
                                Monto:
                                <input
                                    type="number"
                                    step="0.01"
                                    value={nuevaCuota.monto_c}
                                    onChange={e => setNuevaCuota({ monto_c: e.target.value })}
                                    className="border p-1 ml-2"
                                    required
                                />
                            </label>
                            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Crear</button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}

export default Cuotas;