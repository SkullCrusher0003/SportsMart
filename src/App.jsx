import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home/Home";
import MyState from "./context/data/myState";
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

function App() {
  return (
    <MyState>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={
            <ProtectedRoutes>
              <Order />
            </ProtectedRoutes>
          } />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={
            <ProtectedRoutesForAdmin>
              <Dashboard />
            </ProtectedRoutesForAdmin>
          } />
          <Route path="/wholesaler-dashboard" element={
            <ProtectedRoutesForWholesaler>
              <WholesalerDashboard />
            </ProtectedRoutesForWholesaler>
          } />
          <Route path="/productinfo/:id" element={<ProductInfo />} />
          <Route path="/allproducts" element={<AllProducts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/addproduct" element={
            <ProtectedRoutesForAdmin>
              <AddProduct />
            </ProtectedRoutesForAdmin>
          } />
          <Route path="/updateproduct" element={
            <ProtectedRoutesForAdmin>
              <UpdateProduct />
            </ProtectedRoutesForAdmin>
          } />
          <Route path="/*" element={<NoPage />} />
        </Routes>
        <ToastContainer />
      </Router>
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
  const user = getUserFromStorage('currentUser');
  const admin = getUserFromStorage('currentAdmin');
  const wholesaler = getUserFromStorage('currentWholesaler');
  if (user || admin || wholesaler) {
    return children;
  }
  return <Navigate to='/login' />;
}

// Protected route for admin
export const ProtectedRoutesForAdmin = ({ children }) => {
  const admin = getUserFromStorage('user');
  console.log(admin)
  if (admin?.user?.email == 'testretailer@gmail.com') {
    return children;
  }
  return <Navigate to='/login' />;
}

// Protected route for wholesaler
export const ProtectedRoutesForWholesaler = ({ children }) => {
  const wholesaler = getUserFromStorage('user');
  if (wholesaler?.user?.email === 'arnavgupta5107@gmail.com') {
    return children;
  }
  return <Navigate to='/login' />;
}

export default App;
