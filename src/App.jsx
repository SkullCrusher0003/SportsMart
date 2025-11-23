import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home/Home";
import MyState from "./context/data/myState";
import LocationProvider from "./context/location/LocationContext";
import Order from "./pages/order/Order";
import NoPage from "./pages/nopage/NoPage";
import Cart from "./pages/cart/Cart";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import WholesalerDashboard from "./pages/wholesaler/dashboard/WholesalerDashboard";
import ProductInfo from "./pages/productInfo/ProductInfo";
import Login from "./pages/registration/Login";
import Signup from "./pages/registration/Signup";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AddProduct from "./pages/admin/pages/AddProduct";
import UpdateProduct from "./pages/admin/pages/UpdateProduct";
import AllProducts from "./pages/allproducts/AllProducts";
import ShopListing from "./components/shop/ShopListing";
import OrderTracking from "./components/order/OrderTracking";

function App() {
  return (
    <MyState>
      <LocationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order" element={
              <ProtectedRoutes>
                <Order />
              </ProtectedRoutes>
            } />
            <Route path="/order-tracking/:orderId" element={
              <ProtectedRoutes>
                <OrderTracking />
              </ProtectedRoutes>
            } />
            <Route path="/cart" element={<Cart />} />
            <Route path="/shops" element={<ShopListing />} />
            
            {/* Dashboard accessible by both retailers and admins */}
            <Route path="/dashboard" element={
              <ProtectedRoutesForAdmin>
                <Dashboard />
              </ProtectedRoutesForAdmin>
            } />
            
            {/* Wholesaler Dashboard */}
            <Route path="/wholesaler-dashboard" element={
              <ProtectedRoutesForWholesaler>
                <WholesalerDashboard />
              </ProtectedRoutesForWholesaler>
            } />
            
            <Route path="/productinfo/:id" element={<ProductInfo />} />
            <Route path="/allproducts" element={<AllProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Allow both Admin and Wholesaler to add products */}
            <Route path="/addproduct" element={
              <ProtectedRoutesForAdminAndWholesaler>
                <AddProduct />
              </ProtectedRoutesForAdminAndWholesaler>
            } />
            
            {/* Allow both Admin and Wholesaler to update products */}
            <Route path="/updateproduct" element={
              <ProtectedRoutesForAdminAndWholesaler>
                <UpdateProduct />
              </ProtectedRoutesForAdminAndWholesaler>
            } />
            
            <Route path="/*" element={<NoPage />} />
          </Routes>
          <ToastContainer />
        </Router>
      </LocationProvider>
    </MyState>
  )
}

// Helper function to safely get user data from localStorage
const getUserFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return null;
  }
}

// Protected route for regular users (any authenticated user)
export const ProtectedRoutes = ({ children }) => {
  const user = getUserFromStorage('user');
  if (user) {
    return children;
  }
  return <Navigate to='/login' />;
}

// Protected route for admin/retailer - UPDATED to include regular users
export const ProtectedRoutesForAdmin = ({ children }) => {
  const user = getUserFromStorage('user');
  
  if (!user) {
    return <Navigate to='/login' />;
  }
  
  const userType = user?.userType;
  
  // Allow users with 'retailer', 'admin' userType, or any logged-in user (regular customers)
  if (userType === 'retailer' || userType === 'admin' || user) {
    return children;
  }
  
  return <Navigate to='/login' />;
}

// Protected route for wholesaler
export const ProtectedRoutesForWholesaler = ({ children }) => {
  const user = getUserFromStorage('user');
  
  if (!user) {
    return <Navigate to='/login' />;
  }
  
  const userType = user?.userType;
  
  // Allow users with 'wholesaler' userType
  if (userType === 'wholesaler') {
    return children;
  }
  
  return <Navigate to='/login' />;
}

// Protected route for both Admin/Retailer and Wholesaler
export const ProtectedRoutesForAdminAndWholesaler = ({ children }) => {
  const user = getUserFromStorage('user');
  
  if (!user) {
    return <Navigate to='/login' />;
  }
  
  const userType = user?.userType;
  
  // Allow retailer, admin, and wholesaler userTypes
  if (userType === 'retailer' || userType === 'admin' || userType === 'wholesaler') {
    return children;
  }
  
  return <Navigate to='/login' />;
}

export default App;