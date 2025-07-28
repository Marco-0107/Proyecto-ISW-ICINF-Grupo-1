import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { 
  ArrowLeft, 
  Edit3, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Users, 
  UserPlus,
  UserMinus,
  AlertCircle,
  Send
} from 'lucide-react';
import { getInscripcionUsuario, inscribirUsuario, eliminarInscripcion } from '@services/convocatoria.service';
import PostulacionForm from './PostulacionForm';

const ConvocatoriaDetail = ({ convocatoria, onBack, onEdit, userRole }) => {
  const { user } = useAuth();
  const [inscrito, setInscrito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingInscripcion, setCheckingInscripcion] = useState(true);
  const [showPostulacionForm, setShowPostulacionForm] = useState(false);

  useEffect(() => {
    if (user && convocatoria) {
      checkInscripcionUsuario();
    }
  }, [user, convocatoria]);

  const checkInscripcionUsuario = async () => {
    try {
      setCheckingInscripcion(true);
      const inscripcion = await getInscripcionUsuario(user.id, convocatoria.id_convocatoria);
      setInscrito(!!inscripcion);
    } catch (error) {
      console.error('Error al verificar inscripción:', error);
      setInscrito(false);
    } finally {
      setCheckingInscripcion(false);
    }
  };

  const handleInscripcion = async () => {
    try {
      setLoading(true);
      
      if (inscrito) {
        await eliminarInscripcion(user.id, convocatoria.id_convocatoria);
        setInscrito(false);
      } else {
        await inscribirUsuario({ 
          id: user.id, 
          id_convocatoria: convocatoria.id_convocatoria 
        });
        setInscrito(true);
      }
    } catch (error) {
      console.error('Error al procesar inscripción:', error);
      alert(inscrito ? 'Error al cancelar inscripción' : 'Error al inscribirse');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRequisitos = (requisitos) => {
    return requisitos.split(';').map(req => req.trim()).filter(req => req.length > 0);
  };

  const getEstadoInfo = () => {
    const now = new Date();
    const fechaInicio = new Date(convocatoria.fecha_inicio);
    const fechaCierre = new Date(convocatoria.fecha_cierre);
    
    if (!convocatoria.estado) {
      return {
        texto: 'Inactiva',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <XCircle className="w-5 h-5" />
      };
    }
    
    if (now < fechaInicio) {
      return {
        texto: 'Próximamente',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: <Clock className="w-5 h-5" />
      };
    }
    
    if (now > fechaCierre) {
      return {
        texto: 'Cerrada',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: <XCircle className="w-5 h-5" />
      };
    }
    
    return {
      texto: 'Activa',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: <CheckCircle2 className="w-5 h-5" />
    };
  };

  const estadoInfo = getEstadoInfo();
  const canManageConvocatorias = ['admin', 'presidenta', 'secretario'].includes(userRole?.toLowerCase());
  const isVecino = userRole?.toLowerCase() === 'vecino';
  const puedePostular = convocatoria.estado && 
                       new Date() >= new Date(convocatoria.fecha_inicio) && 
                       new Date() <= new Date(convocatoria.fecha_cierre);

  if (!convocatoria) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Convocatoria no encontrada
          </h2>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-700">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 
                     rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalle de Convocatoria
            </h1>
            <p className="text-gray-600">
              Información completa de la convocatoria
            </p>
          </div>
        </div>
        
        {canManageConvocatorias && (
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white 
                     rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar
          </button>
        )}
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header de la convocatoria */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {convocatoria.titulo}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatFecha(convocatoria.fecha_inicio)} - {formatFecha(convocatoria.fecha_cierre)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Actualizada: {formatFecha(convocatoria.fechaActualizacion)}
                </div>
              </div>
            </div>
            
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color} ${estadoInfo.bgColor}`}>
              {estadoInfo.icon}
              <span className="ml-1">{estadoInfo.texto}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Descripción
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {convocatoria.descripcion}
              </p>
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Requisitos
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {formatRequisitos(convocatoria.requisitos).map((requisito, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{requisito}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fechas importantes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Fechas Importantes
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-800">Fecha de Inicio</span>
                </div>
                <p className="text-green-700 font-semibold">
                  {formatFecha(convocatoria.fecha_inicio)}
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-red-800">Fecha de Cierre</span>
                </div>
                <p className="text-red-700 font-semibold">
                  {formatFecha(convocatoria.fecha_cierre)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones para vecinos */}
        {isVecino && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {inscrito ? 'Ya estás inscrito' : 'Postular a esta convocatoria'}
                </h4>
                <p className="text-gray-600">
                  {inscrito 
                    ? 'Has confirmado tu participación en esta convocatoria'
                    : puedePostular 
                      ? 'Completa tu postulación subiendo los documentos requeridos'
                      : 'Esta convocatoria no está disponible para postulaciones'
                  }
                </p>
              </div>
              
              {puedePostular && !inscrito && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPostulacionForm(true)}
                    disabled={loading || checkingInscripcion}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white 
                             rounded-lg hover:bg-blue-700 transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Postular con Documentos
                  </button>
                  
                  <button
                    onClick={handleInscripcion}
                    disabled={loading || checkingInscripcion}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white 
                             rounded-lg hover:bg-green-700 transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Procesando...' : 'Inscripción Simple'}
                  </button>
                </div>
              )}

              {inscrito && (
                <button
                  onClick={handleInscripcion}
                  disabled={loading || checkingInscripcion}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white 
                           rounded-lg hover:bg-red-700 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserMinus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Procesando...' : 'Cancelar Inscripción'}
                </button>
              )}
            </div>
            
            {inscrito && (
              <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Inscripción confirmada
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Postulación */}
      {showPostulacionForm && (
        <PostulacionForm
          convocatoria={convocatoria}
          usuario={user}
          onClose={() => setShowPostulacionForm(false)}
          onSuccess={() => {
            setShowPostulacionForm(false);
            setInscrito(true);
          }}
        />
      )}
    </div>
  );
};

export default ConvocatoriaDetail;
