import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCuota, createCuota } from '../services/cuotas.service';

const Cuotas = () => {
    const { user } = useAuth();
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevaCuota, setNuevaCuota] = useState({
        monto_c: ''
    });

    useEffect(() => {
        console.log("Usuario logueado:", user);
        const fetchCuotas = async () => {
            try {
                const data = await getCuota();
                console.log("Cuotas recibidas:", data);
                setCuotas(data);
            } catch (error) {
                console.log("No se pudieron cargar las cuotas.");
            }
        };

            fetchCuotas();
    }, []);

    const handleCrearCuota = async (e) => {
        e.preventDefault();

        try{
            await createCuota({
                monto_c: parseFloat(nuevaCuota.monto_c)
            });

            alert("Cuota creada correctamente");
            setNuevaCuota({ monto_c: ''});
            setMostrarFormulario(false);
            fetchCuotas();  
        } catch(error){
            console.log("Error completo:", error)
            alert("Error al crear la cuota");
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Cuotas</h1>
            <p>Recuerde adjuntar su comprobante o boleta a tiempo.</p>
            {loading ? (
                <p>Cargando cuotas...</p>
            ) : cuotas.length > 0 ? (
                <ul className="space-y-2">
                    {cuotas.map((cuota) => (
                        <li key={cuota.id_cuota} className="bg-white p-4 border rounded">
                            <p><strong>Fecha de Emisión:</strong> {cuota.fecha_emision}</p>
                            <p><strong>Fecha de Actualización:</strong> {cuota.fechaActualizacion}</p>
                            <p><strong>Monto:</strong> ${cuota.monto_c.toLocaleString("es-CL")}</p>
                            <p><strong>Estado:</strong> {cuota.estado}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay cuotas registradas</p>
            )}
        </div>
    );

    return (
        <div ckassName='p-6'>
            <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="mb-2 text-sm font-semibold text-blue-600 hover:underline">
                {mostrarFormulario ? "Cancelar" : "Crear cuota"}
            </button>

            {mostrarFormulario && (
                <form onSubmit="md:col-span-2">
                    
                </form>
            )}
        </div>
    )
};

export default Cuotas;