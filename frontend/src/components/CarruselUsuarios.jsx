import React, { useState, useEffect } from 'react';
import axios from '@services/root.service';
import useEditToken from "@hooks/tokenss/useEditToken";
import useGetTokens from "@hooks/tokenss/useGetTokens";
import { ChevronLeft, ChevronRight, TicketPlus, Copy } from 'lucide-react';

const CarruselUsuarios = ({
  usuarios,
  isVecino,
  isPresidenta,
  onToggleAsistencia,
  idReunion,
  idToken
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const { tokens, fetchTokens } = useGetTokens();
  const { cerrarToken } = useEditToken(fetchTokens);

  const [tokenActivo, setTokenActivo] = useState(null);

  const itemsPerPage = 4;
  const usuariosFiltrados = usuarios
    .filter(u => {
      const nombre = `${u.User?.nombre} ${u.User?.apellido}`.toLowerCase();
      const rut = u.User?.rut.toLowerCase();
      const q = busqueda.toLowerCase();
      return nombre.includes(q) || rut.includes(q);
    })
    .sort((a, b) => b.asistio - a.asistio);

  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalPages);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);

  const getCurrentUsers = () => {
    const start = currentIndex * itemsPerPage;
    return usuariosFiltrados.slice(start, start + itemsPerPage);
  };

  // Sincronizar tokenActivo con los tokens obtenidos
  useEffect(() => {
    fetchTokens(); // Asegurarse de que se carguen los tokens
  }, []);

  // Buscar el token activo de la reunión específica
  useEffect(() => {
    if (tokens.length > 0 && idReunion) {
      // Buscar el token más reciente de esta reunión específicamente
      const tokenDeReunion = tokens
        .filter(t => t.id_reunion === parseInt(idReunion))
        .sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion))[0];
      
      setTokenActivo(tokenDeReunion || null);
      console.log("Token encontrado para la reunión:", tokenDeReunion);
    }
  }, [tokens, idReunion]);

  // Generar nuevo token
  const generarToken = async () => {
    try {
      const res = await axios.post("/token", { id_reunion: parseInt(idReunion) });
      const nuevo = res.data.data;
      console.log("Token generado:", nuevo);
      alert(`✅ Token generado: ${nuevo.numero_token}`);
      
      // Actualizar los tokens y luego establecer el nuevo token como activo
      await fetchTokens();
      setTokenActivo(nuevo);
    } catch (error) {
      console.error("Error al generar token:", error);
      alert("❌ Error al generar el token");
    }
  };

  // Copiar token al portapapeles
  const copiarToken = async () => {
    if (tokenActivo?.numero_token) {
      try {
        await navigator.clipboard.writeText(tokenActivo.numero_token);
        alert("📋 Token copiado al portapapeles");
      } catch (error) {
        console.error("Error al copiar token:", error);
        alert("❌ Error al copiar el token");
      }
    }
  };

  return (
    <div className="bg-white shadow rounded border border-black p-4">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        {/* Título y totales */}
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Participantes</h3>
          <span className="font-bold text-gray-700">({usuarios.length})</span>
          {!isVecino && (
            <>
              <span className="text-green-600 text-sm">
                ✅ {usuarios.filter(u => u.asistio).length} presentes
              </span>
              <span className="text-red-600 text-sm">
                ❌ {usuarios.filter(u => !u.asistio).length} ausentes
              </span>
            </>
          )}
        </div>

        {/* Buscador */}
        {!isVecino && (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Busqueda nombre/Rut"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border border-gray-400 rounded-md px-4 py-2"
            />
          </div>
        )}

        {/* Botones Token */}
        {isPresidenta && (
          <div className="flex items-center gap-2">
            {!tokenActivo ? (
              <button
                onClick={generarToken}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded shadow transition"
              >
                <TicketPlus className="w-4 h-4" /> Generar Token
              </button>
            ) : tokenActivo.estado === "activo" ? (
              <button
                onClick={async () => {
                  try {
                    await cerrarToken(tokenActivo.id_token);
                    // Actualizar el estado local inmediatamente
                    setTokenActivo(prev => prev ? {...prev, estado: "cerrado"} : null);
                    alert("✅ Token cerrado correctamente");
                  } catch (error) {
                    console.error("Error al cerrar token:", error);
                    alert("❌ Error al cerrar el token");
                  }
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded shadow transition"
              >
                <TicketPlus className="w-4 h-4" /> Cerrar Token
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-gray-400 text-white font-semibold py-2 px-3 rounded cursor-not-allowed">
                <TicketPlus className="w-4 h-4" /> Token ya cerrado
              </div>
            )}
            {tokenActivo && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Token: {tokenActivo.numero_token} 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    tokenActivo.estado === "activo" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {tokenActivo.estado === "activo" ? "🟢 Activo" : "🔴 Cerrado"}
                  </span>
                </span>
                <button
                  onClick={copiarToken}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs shadow transition"
                  title="Copiar token al portapapeles"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            )}
          </div>
        )}


        {/* Navegación */}
        {!isVecino && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalPages <= 1}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm text-gray-500 px-2">
              {currentIndex + 1} / {totalPages}
            </span>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalPages <= 1}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Carrusel reducido */}
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getCurrentUsers().map((usuario) => (
            <div
              key={usuario.id_usuario}
              className="bg-gray-50 border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow text-sm h-32"
            >
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 truncate text-sm">
                  {usuario.User?.nombre} {usuario.User?.apellido}
                </h4>

                {usuario.asistio && usuario.fecha_confirmacion_asistencia && (
                  <p className="text-xs text-green-600 font-medium">
                    Confirmado: {new Date(usuario.fecha_confirmacion_asistencia).toLocaleString()}
                  </p>
                )}

                <p className="text-xs text-gray-600">RUT: {usuario.User?.rut}</p>

                {!isVecino && (
                  <p className="text-xs text-gray-600 capitalize">Rol: {usuario.User?.rol}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                  {usuario.asistio ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Presente
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ❌ Ausente
                    </span>
                  )}

                  {isPresidenta && !isVecino && (
                    <button
                      onClick={() => onToggleAsistencia(usuario)}
                      className={`text-xs font-semibold py-1 px-2 rounded transition-colors ${usuario.asistio
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                      {usuario.asistio ? 'Quitar' : 'Marcar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!isVecino && totalPages > 1 && (
        <div className="flex justify-center mt-3 gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarruselUsuarios;
