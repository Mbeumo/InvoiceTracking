//import { Routes, Route, Navigate } from 'react-router-dom';
//import { LoginForm } from '../pages/LoginForm';
//import { Dashboard } from '../pages/Dashboard';
//import NotFound from '../pages/NotFound';
//import UnauthorizedAccess from '../components/UnauthorizedAccess';
//import { User, Permissions } from '../types/auth';
//import { ProtectedRoute } from './ProtectedRoute';
//import index  from './index';

////seeems like this file is not even used 

//interface AppRoutesProps {
//  isAuthenticated: boolean;
//  user: User | null;
//  login: () => void;
//  isLoading: boolean;
//  setShowRegister: (show: boolean) => void;
//}

//const AppRoutes = ({ isAuthenticated, user, login, isLoading, setShowRegister }: AppRoutesProps) => {
//  return (
//    <Routes>
//      <Route
//        path="/"
//        element={
//          isAuthenticated && user ? (
//            <Navigate to="/dashboard" />
//          ) : (
//            <LoginForm
//              onSwitchToRegister={() => setShowRegister(true)}
//            />
//          )
//        }
//      />
//      <Route
//        path="/dashboard"
//        element={
//          isAuthenticated && user ? (
//            <Dashboard user={user} />
//          ) : (
//            <UnauthorizedAccess 
//              isAuthenticated={isAuthenticated}
//              message="Please log in to access the dashboard."
//            />
//          )
//        }
//      />
      
//      {/* Protected routes with permission checks */}

//          {/* <Route
//        path="/invoices"

//        element={
//          isAuthenticated && user?.permission ? ((p: Permissions) => p.codename === 'view_invoice') ?
//            (
//              <div className="p-8 text-center">
//                <h1 className="text-2xl font-bold">Invoices Page</h1>
//                <p>Invoice management coming soon...</p>
//              </div>
//            ) : (
//              <UnauthorizedAccess 
//                isAuthenticated={true}
//                message="You don't have permission to view invoices."
//              />
//            )
//          ) : (
//            <UnauthorizedAccess 
//              isAuthenticated={false}
//              message="Please log in to access invoices."
//            />
//          )
//        }
//      />*/}
//          <Route
//              path="/invoices"
//              routeConfigs.map(({path, element}) => (
//          <Route key={path} path={path} element={element} />
//          ))

//          />
      
//      <Route
//        path="/users"
//        element={
//          isAuthenticated && user ? (
//                user.permission ? ((p: Permissions) => p.codename === 'manage_users') ? (
//              <div className="p-8 text-center">
//                <h1 className="text-2xl font-bold">Users Management</h1>
//                <p>User management coming soon...</p>
//              </div>
//            ) : (
//              <UnauthorizedAccess 
//                isAuthenticated={true}
//                message="You don't have permission to manage users."
//              />
//            )
//          ) : (
//            <UnauthorizedAccess 
//              isAuthenticated={false}
//              message="Please log in to access user management."
//            />
//          )
//        }
//      />
      
//      <Route
//        path="/settings"
//        element={
//          isAuthenticated && user ? (
//            <div className="p-8 text-center">
//              <h1 className="text-2xl font-bold">Settings</h1>
//              <p>Settings page coming soon...</p>
//            </div>
//          ) : (
//             <UnauthorizedAccess 
//              isAuthenticated={false}
//              message="Please log in to access settings."
//            />
//          )
//        }
//      />
      
//      {/* 404 Not Found - passes user context for personalized experience */}
//      <Route 
//        path="*" 
//        element={
//          <NotFound 
//            isAuthenticated={isAuthenticated} 
//            user={user} 
//          />
//        } 
//      />
//    </Routes>
//  );
//};

//export default AppRoutes;