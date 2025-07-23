import { NavLink, useNavigate } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import { useState } from "react";
import { useAuth } from '@context/AuthContext';
import {
    Home,
    Calendar,
    Coins,
    Users,
    DollarSign,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userRole = user?.rol;
    const [isOpen, setIsOpen] = useState(true);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const menuItems = [
        {
            to: "/home",
            label: "Inicio",
            icon: Home,
            show: true
        },
        {
            to: "/reuniones",
            label: "Reuniones",
            icon: Calendar,
            show: true
        },
        {
            to: "/tokens",
            label: "Tokens",
            icon: Coins,
            show: userRole === 'admin' || userRole === 'presidenta'
        },
        {
            to: "/users",
            label: "Usuarios",
            icon: Users,
            show: true
        },
        {
            to: "/movfin",
            label: "Movimientos Financieros",
            icon: DollarSign,
            show: userRole === 'admin' || userRole === 'tesorera' || userRole === 'secretario' || userRole === 'presidenta'
        },
        {
            to: "/cuotas",
            label: "Mis cuotas",
            icon: DollarSign,
            show: userRole == 'admin' || userRole === 'vecino'
        }
    ];

    return (
        <>
            {/* Overlay para celular */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={closeSidebar} 
                />
            )}

            {/* Botón para contraer la barra */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden bg-gray-800 text-white
                p-2 rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-300
                hover:scale-105 block"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static top-0 lg:top-auto left-0 lg:left-auto 
                h-screen w-64 bg-gray-800 text-white z-50 lg:z-auto
                transform lg:transform-none transition-transform duration-300 ease-in-out lg:transition-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                flex flex-col shadow-xl
            `}>
                {/* Header del sidebar */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white">Panel</h2>
                    <button
                        className="lg:hidden text-gray-400 hover:text-white p-1
                        rounded transition-colors duration-200"
                        onClick={closeSidebar}
                        aria-label="Cerrar sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navegación por las páginas */}
                <nav className="flex-1 py-4 overflow-y-auto min-h-0">
                    <ul className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            if (!item.show) return null;

                            const IconComponent = item.icon;

                            return (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `flex items-center px-3 py-3 rounded-lg text-sm font-medium
                                            transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-lg' 
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`
                                        }
                                        onClick={closeSidebar}
                                    >
                                        <IconComponent size={20} className="mr-3 flex-shrink-0"/>
                                        <span className="truncate">{item.label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}

                        {/* Separador */}
                        <li className="my-4">
                            <hr className="border-gray-700"/>
                        </li>

                        {/* Botón de logout */}
                        <li>
                            <button
                                className="w-full flex items-center px-3 py-3
                                rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/20 
                                hover:text-red-300 transition-all duration-200 group"
                                onClick={() => {
                                    logoutSubmit();
                                    closeSidebar();
                                }}
                            >
                                <LogOut size={20} className="mr-3 flex-shrink-0" />
                                <span className="truncate">Cerrar Sesión</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Footer con información del usuario */}
                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full
                        flex items-center justify-center font-semibold text-white">
                            {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.nombre || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-400 truncate capitalize">
                                {userRole || 'Sin rol'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;