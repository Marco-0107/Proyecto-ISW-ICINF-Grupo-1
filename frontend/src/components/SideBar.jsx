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
            <div className="flex min-h-screen">
                {/* Overlay para celular */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={closeSidebar}
                    />
                )}

                {/* Botón para contraer la barra */}
                <button
                    className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-r from-green-700 to-green-800 
                    text-white p-2 rounded-lg shadow-lg hover:from-green-800 hover:to-green-900 
                    transition-all duration-300 hover:scale-105 block border border-green-600"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Sidebar */}
                <aside className={`
                    fixed lg:static top-0 lg:top-auto left-0 lg:left-auto 
                    h-full w-64 bg-gradient-to-b from-green-800 via-green-700 to-green-900 
                    text-white z-50 lg:z-auto
                    transform lg:transform-none transition-transform duration-500 ease-in-out lg:transition-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                    flex flex-col shadow-2xl border-r border-green-600
                `}>
                    {/* Header del sidebar */}
                    <div className="flex items-center justify-between p-6 border-b border-green-600/50 flex-shrink-0 bg-green-800/50">
                        <h2 className="text-xl font-bold text-green-100 tracking-wide">
                            Panel
                        </h2>
                        <button
                            className="lg:hidden text-green-200 hover:text-white p-1 rounded 
                            transition-colors duration-200 hover:bg-green-700/50"
                            onClick={closeSidebar}
                            aria-label="Cerrar sidebar"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navegación por las páginas */}
                    <nav className="flex-1 py-4 overflow-y-auto min-h-0">
                        <ul className="space-y-2 px-3">
                            {menuItems.map((item) => {
                                if (!item.show) return null;

                                const IconComponent = item.icon;

                                return (
                                    <li key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `flex items-center px-4 py-3 rounded-xl text-sm font-medium
                                                transition-all duration-300 group relative overflow-hidden ${isActive
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                                                    : 'text-green-100 hover:bg-green-700/50 hover:text-white hover:transform hover:scale-102'
                                                }`
                                            }
                                            onClick={closeSidebar}
                                        >
                                            <IconComponent
                                                size={20}
                                                className={`mr-3 flex-shrink-0 transition-all duration-300 ${'group-hover:scale-110'
                                                    }`}
                                            />
                                            <span className="truncate font-medium">{item.label}</span>

                                            {/* Efecto de brillo en hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                                translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                        </NavLink>
                                    </li>
                                );
                            })}

                            {/* Separador */}
                            <li className="my-6">
                                <hr className="border-green-600/50 mx-2" />
                            </li>

                            {/* Footer con información del usuario */}
                            <div className="p-4 border-t border-green-600/50 bg-green-800/30">
                                <div className="flex items-center space-x-3 bg-green-700/40 p-3 rounded-lg border border-green-600/30">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-300 to-white-200 rounded-full
                            flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-green-400/30">
                                        {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-green-100 truncate">
                                            {user?.nombre || 'Usuario'}
                                        </p>
                                        <p className="text-xs text-white-300 truncate capitalize rounded-md mt-1">
                                            {userRole || 'Sin rol'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botón de logout */}
                            <li>
                                <button
                                    className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium 
                                    text-red-200 bg-red-900/40 hover:bg-red-800/60 hover:text-white 
                                    transition-all duration-300 group relative overflow-hidden
                                    border-2 border-red-500/60 hover:border-red-400 shadow-lg
                                    hover:shadow-red-500/20 hover:scale-102"
                                    onClick={() => {
                                        logoutSubmit();
                                        closeSidebar();
                                    }}
                                >
                                    <LogOut size={20} className="mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 text-red-300 group-hover:text-white" />
                                    <span className="truncate font-bold">Cerrar Sesión</span>

                                    {/* Efecto de brillo en hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-300/20 to-transparent 
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>
            </div>
        </>
    );
};

export default Sidebar;