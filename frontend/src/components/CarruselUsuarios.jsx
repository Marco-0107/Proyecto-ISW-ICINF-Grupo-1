import React, { useState, useEffect } from 'react';
import axios from '@services/root.service';
import useEditToken from "@hooks/tokenss/useEditToken";
import useGetTokens from "@hooks/tokenss/useGetTokens";
import { ChevronLeft, ChevronRight, TicketPlus, Copy } from 'lucide-react';
import ToastNotification from './ToastNotification';

const CarruselUsuarios = ({
  usuarios,
  isVecino,
  isPresidenta,
  onToggleAsistencia,
  idReunion,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const { tokens, fetchTokens } = useGetTokens();
  const { cerrarToken } = useEditToken(fetchTokens);
  const [tokenActivo, setTokenActivo] = useState(null);

  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message, type = 'success') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }));
  };

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
      showToast(`¡Token generado: ${nuevo.numero_token}!`, 'success');
      
      // Actualizar los tokens y luego establecer el nuevo token como activo
      await fetchTokens();
      setTokenActivo(nuevo);
    } catch (error) {
      console.error("Error al generar token:", error);
      showToast("Error al generar el token", 'error');
    }
  };

  // Copiar token al portapapeles
  const copiarToken = async () => {
    if (tokenActivo?.numero_token) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(tokenActivo.numero_token.toString());
          showToast("¡Token copiado al portapapeles!", 'success');
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = tokenActivo.numero_token.toString();
          textArea.style.position = 'absolute';
          textArea.style.left = '-9999px';
          textArea.style.top = '0';
          textArea.style.opacity = '0';
          textArea.setAttribute('readonly', '');
          textArea.style.userSelect = 'text';
          
          document.body.appendChild(textArea);
          
          if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
            textArea.contentEditable = true;
            textArea.readOnly = false;
            const range = document.createRange();
            range.selectNodeContents(textArea);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            textArea.setSelectionRange(0, 999999);
          } else {
            textArea.select();
            textArea.setSelectionRange(0, 99999);
          }
          
          let successful = false;
          try {
            successful = document.execCommand('copy');
          } catch (err) {
            successful = false;
          }
          
          document.body.removeChild(textArea);
          
          if (successful) {
            showToast("¡Token copiado al portapapeles!", 'success');
          } else {
            const promptText = `Token de la reunión: ${tokenActivo.numero_token}`;
            if (window.prompt) {
              window.prompt("Copia el token manualmente (Ctrl+C):", tokenActivo.numero_token.toString());
            } else {
              showToast(promptText, 'info');
            }
          }
        }
      } catch (error) {
        console.error("Error al copiar token:", error);
        const promptText = `Token: ${tokenActivo.numero_token}`;
        showToast(promptText, 'info');
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-green-50 shadow-xl rounded-2xl border-2 border-green-200 p-4">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">
            Participantes
          </h3>
          <span className="bg-green-100 text-green-800 font-bold px-2 py-1 rounded-full border border-green-300 text-sm">
            {usuarios.length}
          </span>
          {!isVecino && (
            <>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                {usuarios.filter(u => u.asistio).length} presentes
              </span>
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                {usuarios.filter(u => !u.asistio).length} ausentes
              </span>
            </>
          )}
        </div>

        {!isVecino && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar nombre/RUT..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-3 pr-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-white shadow-sm text-sm"
              />
            </div>
          </div>
        )}

        {/* Botones Token */}
        {isPresidenta && (
          <div className="flex items-center gap-2">
            {!tokenActivo ? (
              <button
                onClick={generarToken}
                className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
              >
                <TicketPlus className="w-3.5 h-3.5" /> Generar Token
              </button>
            ) : tokenActivo.estado === "activo" ? (
              <button
                onClick={async () => {
                  try {
                    await cerrarToken(tokenActivo.id_token);
                    // Actualizar el estado local inmediatamente
                    setTokenActivo(prev => prev ? {...prev, estado: "cerrado"} : null);
                    showToast("¡Token cerrado correctamente!", 'success');
                  } catch (error) {
                    console.error("Error al cerrar token:", error);
                    showToast("Error al cerrar el token", 'error');
                  }
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
              >
                <TicketPlus className="w-3.5 h-3.5" /> Cerrar Token
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-1.5 px-3 rounded-lg shadow-md cursor-not-allowed text-sm">
                <TicketPlus className="w-3.5 h-3.5" /> Token Cerrado
              </div>
            )}
            {tokenActivo && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">
                  Token: <span className="text-green-700 font-mono">{tokenActivo.numero_token}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    tokenActivo.estado === "activo" 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {tokenActivo.estado === "activo" ? "Activo" : "Cerrado"}
                  </span>
                </span>
                <button
                  onClick={copiarToken}
                  className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-1 px-2 rounded-lg text-xs shadow-md transform hover:scale-105 transition-all duration-200"
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
          <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-lg border border-gray-200">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md transform hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={totalPages <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 font-semibold px-3 py-1 bg-white rounded-full border border-gray-300">
              {currentIndex + 1} / {totalPages}
            </span>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md transform hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={totalPages <= 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {getCurrentUsers().map((usuario) => (
            <div
              key={usuario.id_usuario}
              className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-3 hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 h-36"
            >
              <div className="space-y-1.5 h-full flex flex-col">
                {/* Nombre completo más prominente */}
                <h4 className="font-bold text-gray-900 text-sm leading-tight">
                  {usuario.User?.nombre || 'N/A'} {usuario.User?.apellido || ''}
                </h4>

                {usuario.asistio && usuario.fecha_confirmacion_asistencia && (
                  <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-md">
                    Confirmado: {new Date(usuario.fecha_confirmacion_asistencia).toLocaleString()}
                  </p>
                )}

                <div className="bg-gray-100 px-2 py-0.5 rounded-md">
                  <p className="text-xs font-semibold text-gray-800">
                    RUT: {usuario.User?.rut || 'N/A'}
                  </p>
                </div>

                {!isVecino && (
                  <div className="bg-green-50 px-2 py-0.5 rounded-md">
                    <p className="text-xs font-semibold text-green-800 capitalize">
                      Rol: {usuario.User?.rol || 'N/A'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 mt-auto">
                  {usuario.asistio ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                      Presente
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                      Ausente
                    </span>
                  )}

                  {isPresidenta && !isVecino && (
                    <button
                      onClick={() => onToggleAsistencia(usuario)}
                      className={`text-xs font-bold py-0.5 px-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md ${usuario.asistio
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
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
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 transform hover:scale-125 ${
                index === currentIndex 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Toast Notification */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  );
};

export default CarruselUsuarios;
