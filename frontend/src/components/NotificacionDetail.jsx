import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, Edit } from 'lucide-react';
import { deleteNotificacion } from '../services/notificaciones.service';
import { useAuth } from '../context/AuthContext';

// Utilidad para formatear fecha
const formatDate = (fecha) => {
  const fechaObj = new Date(fecha);
  const options = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return fechaObj.toLocaleDateString('es-ES', options).replace(',', ' -');
};

export default function NotificacionDetail({ notificacion, onBack, onEdit }) {
  const { user } = useAuth();
  const isAdmin = ['admin', 'presidenta', 'presidente', 'secretaria', 'secretario'].includes(user?.rol?.toLowerCase());

  const getTipoStyle = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'alerta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'notificacion':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'informacion':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!notificacion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notificación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detalle de Notificación</h1>
        </div>
        
        {isAdmin && (
          <button
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar</span>
          </button>
        )}
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header de la notificación */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getTipoStyle(notificacion.tipo)}`}
                >
                  {notificacion.tipo?.toUpperCase() || 'SIN_TIPO'}
                </span>
                {!notificacion.estado_visualizacion && (
                  <span className="flex items-center space-x-1 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">No vista</span>
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {notificacion.titulo}
              </h2>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>
                  <strong>Publicado:</strong> {formatDate(notificacion.fecha)}
                </span>
                {notificacion.fechaActualizacion && (
                  <span>
                    <strong>Actualizado:</strong> {formatDate(notificacion.fechaActualizacion)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la notificación */}
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {notificacion.descripcion}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium"
        >
          Volver a la lista
        </button>
        
        {isAdmin && (
          <button
            onClick={onEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Editar Notificación
          </button>
        )}
      </div>
    </div>
  );
}
