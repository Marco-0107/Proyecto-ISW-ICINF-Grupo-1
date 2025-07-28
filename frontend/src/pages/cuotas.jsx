import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCuota, createCuota, getCuotasUsuario, getCuotasUsuarioByRut, deleteCuota } from '../services/cuotas.service';
import useDeleteCuota from '../hooks/cuotas/useDeleteCuota';
import useUpdateCuota from '../hooks/cuotas/useEditCuota';
import { Plus, Trash2, Calendar, DollarSign, CheckCircle, XCircle, Receipt } from 'lucide-react';

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

    const { eliminarCuota } = useDeleteCuota();

    useEffect(() => {
        console.log("Usuario logueado:", user);
        fetchCuotas();
    }, []);

    const fetchCuotas = async () => {
        setLoading(true);
        try {
            let data;
            if (user?.rol === 'vecino') {
                const data = await getCuotasUsuarioByRut(user.rut);

                const ordenarCuotas = data.sort((a, b) => {
                    if (a.estado_pago !== b.estado_pago) {
                        return a.estado_pago ? 1 : -1;
                    }
                    return new Date(b.fecha_emision) - new Date(a.fecha_emision);
                })

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
        <div className="min-h-screen bg-gradient-to-br from-white-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Botón para crear cuota*/}
                {(user?.rol === 'admin' || user?.rol === 'presidenta' || user?.rol === 'tesorera') && (
                    <div className="mb-6">
                        <button
                            onClick={() => setMostrarFormulario(!mostrarFormulario)}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            <Plus className="h-5 w-5" />
                            <span>{mostrarFormulario ? "Cancelar" : "Crear Nueva Cuota"}</span>
                        </button>
                    </div>
                )}

                {/* Formulario de creación */}
                {mostrarFormulario && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-green-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span>Crear Nueva Cuota</span>
                        </h3>
                        <form onSubmit={handleCrearCuota} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Monto de la Cuota
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={nuevaCuota.monto_c}
                                        onChange={e => setNuevaCuota({ monto_c: e.target.value })}
                                        className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                                        placeholder="Ingrese el monto"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
                                >
                                    Crear Cuota
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormulario(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de cuotas */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600">Cargando cuotas...</span>
                    </div>
                ) : cuotas.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {cuotas.map((cuota) => (
                            <div key={cuota.id_cuota} className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                {/* Header de la tarjeta */}
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Receipt className="h-5 w-5" />
                                            <span className="font-semibold">Cuota #{cuota.id_cuota}</span>
                                        </div>
                                        {user?.rol === 'vecino' && (
                                            <div className="flex items-center space-x-1">
                                                {cuota.estado_pago ? (
                                                    <CheckCircle className="h-5 w-5 text-green-200" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-200" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contenido de la tarjeta */}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Fecha de Emisión</p>
                                                <p className="font-medium text-gray-900">{cuota.fecha_emision}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Última Actualización</p>
                                                <p className="font-medium text-gray-900">{cuota.fechaActualizacion}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Monto</p>
                                                <p className="font-bold text-2xl text-green-600">
                                                    ${cuota.monto_c.toLocaleString("es-CL")}
                                                </p>
                                            </div>
                                        </div>


                                        {user?.rol === 'vecino' && (
                                            <div className="border-t pt-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500">Estado de Pago</span>
                                                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${cuota.estado_pago
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {cuota.estado_pago ? (
                                                            <>
                                                                <CheckCircle className="h-3 w-3" />
                                                                <span>Pagada</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="h-3 w-3" />
                                                                <span>Pendiente</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón de eliminar */}
                                    {(user?.rol === 'admin' || user?.rol === 'presidenta' || user?.rol === 'tesorera') && (
                                        <div className="pt-4 border-t">
                                            <button
                                                className="w-full inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                                                onClick={() => eliminarCuota(cuota.id_cuota)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Eliminar</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cuotas registradas</h3>
                        <p className="text-gray-500">
                            {user?.rol === 'vecino'
                                ? 'No tienes cuotas asignadas en este momento.'
                                : 'Crea una cuota.'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Cuotas;