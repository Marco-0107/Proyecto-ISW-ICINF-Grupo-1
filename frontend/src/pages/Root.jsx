import { Outlet } from 'react-router-dom';
import Sidebar from '@components/SideBar';
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
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    </>
);
}

export default Root;