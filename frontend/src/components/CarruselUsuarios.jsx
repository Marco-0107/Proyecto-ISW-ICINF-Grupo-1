import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CarruselUsuarios = ({
  usuarios,
  isVecino,
  isPresidenta,
  onToggleAsistencia
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentUsers = () => {
    const start = currentIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return usuarios.slice(start, end);
  };

  if (usuarios.length === 0) {
    return (
      <div className="bg-white shadow rounded p-6 text-center text-gray-500">
        No hay usuarios registrados en esta reunión
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Participantes ({usuarios.length})
        </h3>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalPages <= 1}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <span className="text-sm text-gray-500 px-2">
              {currentIndex + 1} / {totalPages}
            </span>
            
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={totalPages <= 1}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="flex gap-4 min-w-full">
              {usuarios
                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                .map((usuario) => (
                  <div
                    key={usuario.id_usuario}
                    className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {usuario.User?.nombre} {usuario.User?.apellido}
                      </h4>
                      
                      <p className="text-sm text-gray-600">
                        RUT: {usuario.User?.rut}
                      </p>
                      
                      {!isVecino && (
                        <p className="text-sm text-gray-600 capitalize">
                          Rol: {usuario.User?.rol}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          {usuario.asistio ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Presente
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ❌ Ausente
                            </span>
                          )}
                        </div>
                        
                        {isPresidenta && !isVecino && (
                          <button
                            onClick={() => onToggleAsistencia(usuario)}
                            className={`text-xs font-semibold py-1 px-2 rounded transition-colors ${
                              usuario.asistio
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
              
              {/* Rellenar espacios vacíos en la última página */}
              {pageIndex === totalPages - 1 && 
                usuarios.slice(pageIndex * itemsPerPage).length < itemsPerPage &&
                Array.from({ 
                  length: itemsPerPage - usuarios.slice(pageIndex * itemsPerPage).length 
                }).map((_, emptyIndex) => (
                  <div key={`empty-${emptyIndex}`} className="flex-1 min-w-0" />
                ))
              }
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarruselUsuarios;