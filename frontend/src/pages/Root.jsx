import { Outlet } from 'react-router-dom';
import Sidebar from '@components/SideBar';
import Header from '@components/Header';
import { AuthProvider } from '@context/AuthContext';

function Root()  {
return (
    <AuthProvider>
        <PageRoot/>
    </AuthProvider>
);
}

function PageRoot() {
return (
    <>
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1 lg:ml-10 p-4 pt-20">
                <Outlet />
            </main>
        </div>
        {/* Header global con botón de notificaciones */}
        <Header />
    </>
);
}

export default Root;