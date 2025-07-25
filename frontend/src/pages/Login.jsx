import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import useLogin from '@hooks/auth/useLogin.jsx';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange
    } = useLogin();

    const validateField = (name, value) => {
        let error = '';

        if (name === 'email') {
            if (!value) {
                error = 'El correo electrónico es requerido';
            } else if (value.length < 15) {
                error = 'El correo debe tener al menos 15 caracteres';
            } else if (value.length > 30) {
                error = 'El correo no puede tener más de 30 caracteres';
            } else if (!value.endsWith('@gmail.com')) {
                error = 'El correo debe terminar en @gmail.com';
            }
        }

        if (name === 'password') {
            if (!value) {
                error = 'La contraseña es requerida';
            } else if (value.length < 8) {
                error = 'La contraseña debe tener al menos 8 caracteres';
            } else if (value.length > 26) {
                error = 'La contraseña no puede tener más de 26 caracteres';
            } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
                error = 'Debe contener solo letras y números';
            }
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        handleInputChange(name, value);
    };

    const loginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);

        if (emailError || passwordError) {
            setErrors({
                email: emailError,
                password: passwordError
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await login(formData);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                errorData(response.details);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Panel izquierdo - Bienvenida */}
            <div className="flex-1 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-start pl-16 pr-12 relative overflow-hidden">

                {/* Círculo decorativo */}
                <div className="absolute -right-40 -top-32 w-96 h-96 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white bg-opacity-5 rounded-full"></div>

                <div className="text-white max-w-md z-10">
                    <h1 className="text-4xl font-bold mb-6">
                        Bienvenid@ de nuevo!
                    </h1>
                    <div className="w-12 h-1 bg-white mb-6"></div>
                    <p className="text-black-200 text-lg leading-relaxed mb-8">
                        Recuerda iniciar sesión con las credenciales que le fueron otorgadas
                        por la directiva, en caso de olvidar las credenciales, comunicarse
                        directamente con ellos.
                    </p>
                </div>
            </div>

            {/* Panel derecho - Formulario */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-12 relative">
                {/* Círculos decorativos */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-gray-200 rounded-full opacity-600"></div>
                <div className="absolute bottom-32 left-20 w-24 h-24 bg-gray-300 rounded-full opacity-400"></div>

                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
                        <div className="w-12 h-1 bg-green-500 mx-auto"></div>
                    </div>

                    <form onSubmit={loginSubmit} className="space-y-6">
                        {/* Campo Email */}
                        <div>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ejemplo@gmail.com"
                                className={`w-full px-4 py-4 bg-white border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors placeholder-gray-400 ${errors.email || errorEmail
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200'
                                    }`}
                                autoComplete="email"
                                required
                            />
                            {(errors.email || errorEmail) && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.email || errorEmail}
                                </p>
                            )}
                        </div>

                        {/* Campo Password */}
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Ingresa tu contraseña..."
                                    className={`w-full px-4 py-4 bg-white border-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors placeholder-gray-400 pr-12 ${errors.password || errorPassword
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-200'
                                        }`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {(errors.password || errorPassword) && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.password || errorPassword}
                                </p>
                            )}
                        </div>

                        {/* Botón Login */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    INICIANDO...
                                </div>
                            ) : (
                                'INICIAR SESIÓN'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;