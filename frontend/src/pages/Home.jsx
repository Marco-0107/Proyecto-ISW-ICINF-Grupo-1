import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import parqueEcuadorImg from '@assets/parque-ecuador-bg.jpeg';

export default function Home() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    fetchWeather();

    return () => clearInterval(timer);
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=-36.8201&lon=-73.0444&appid=f2f1c5bbb22b2d5f32a287d0b99baf7a&units=metric&lang=es`
      );
      
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      
      const data = await response.json();
      console.log('Datos del clima:', data); 
      setWeather(data);
      
    } catch (error) {
      console.error('Error obteniendo clima:', error);
      setWeather({
        main: { temp: 10, feels_like: 8 },
        weather: [{ description: 'cielo despejado', icon: '01d' }],
        name: 'Concepción'
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getWeatherEmoji = (description) => {
    const desc = description?.toLowerCase() || '';
    
    if (desc.includes('despejado') || desc.includes('claro') || desc.includes('sol')) return '☀️';
    if (desc.includes('pocas nubes') || desc.includes('algo nublado')) return '🌤️';
    if (desc.includes('nubes dispersas') || desc.includes('parcialmente nublado')) return '⛅';
    if (desc.includes('muy nublado') || desc.includes('nublado') || desc.includes('cubierto')) return '☁️';
    if (desc.includes('lluvia ligera') || desc.includes('llovizna')) return '🌦️';
    if (desc.includes('lluvia') || desc.includes('precipitación')) return '🌧️';
    if (desc.includes('tormenta') || desc.includes('trueno')) return '⛈️';
    if (desc.includes('nieve')) return '❄️';
    if (desc.includes('niebla') || desc.includes('bruma')) return '🌫️';
    if (desc.includes('ventoso') || desc.includes('viento')) return '💨';
    
    return '🌤️';
  };

  const getDayNightIndicator = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 6 && hour < 20) {
      return { emoji: '☀️', text: 'Día' };
    } else {
      return { emoji: '🌙', text: 'Noche' };
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${parqueEcuadorImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(2px)',
    opacity: 0.6,
    position: 'fixed',
    top: 0,
    left: '16rem', // 256px = w-64 del sidebar
    right: 0,
    bottom: 0,
    zIndex: 1
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      {/* Imagen de fondo que cubre solo el área de contenido (excluyendo sidebar) */}
      <div style={backgroundStyle}></div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-6">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              🏡 Bienvenido
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-gray-700 mb-4">
              Villa Parque Ecuador
            </h2>
            <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <p className="text-lg md:text-xl text-gray-600 font-light">
              {getGreeting()}, <span className="font-semibold text-green-700">{user?.nombre}</span>
            </p>
            
            <p className="text-base text-gray-600 leading-relaxed">
              Te damos la bienvenida al sistema de gestión de nuestra comunidad. 
              Aquí podrás mantenerte informado sobre reuniones, publicaciones y 
              participar activamente en la vida de nuestro barrio.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3 pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🌳</span>
                <span className="font-medium">Naturaleza</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🏘️</span>
                <span className="font-medium">Comunidad</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-2xl">🤝</span>
                <span className="font-medium">Participación</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="text-2xl mb-3">🕐</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hora actual</h3>
            <p className="text-xl font-mono text-green-700">
              {currentTime.toLocaleTimeString()}
            </p>
            <p className="text-gray-600 mt-1 text-sm">
              {currentTime.toLocaleDateString('es-CL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="text-2xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tu perfil</h3>
            <p className="text-base text-gray-700">
              <span className="font-medium">{user?.nombre} {user?.apellido}</span>
            </p>
            <p className="text-green-600 font-medium capitalize mt-1 text-sm">
              {user?.rol}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {user?.email}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl">
                {weatherLoading ? '🌡️' : getWeatherEmoji(weather?.weather?.[0]?.description)}
              </div>
              <button
                onClick={() => {
                  setWeatherLoading(true);
                  fetchWeather();
                }}
                className="text-gray-500 hover:text-gray-700 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                title="Actualizar clima"
              >
                🔄
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clima en Concepción</h3>
            {weatherLoading ? (
              <p className="text-gray-600 text-sm">Cargando...</p>
            ) : weather ? (
              <>
                <p className="text-xl font-bold text-blue-600">
                  {Math.round(weather.main.temp)}°C
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-gray-600 capitalize text-sm">
                    {weather.weather[0].description}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{getDayNightIndicator().emoji}</span>
                    <span className="text-gray-600 text-xs">{getDayNightIndicator().text}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Sensación térmica: {Math.round(weather.main.feels_like)}°C
                </p>
              </>
            ) : (
              <p className="text-gray-600 text-sm">No disponible</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <p className="text-gray-800 italic font-medium">
              "Juntos construimos un mejor lugar para vivir"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
