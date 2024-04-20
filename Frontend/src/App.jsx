import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Loader from "./components/Loader.jsx";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

const Home = lazy(() => import("./pages/Home.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));
const Shipping = lazy(() => import("./pages/shipping.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Orders = lazy(() => import("./pages/Orders.jsx"));
import Header from "./components/Header.jsx";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";
import { userExist, userNotExist } from "./redux/reducer/userReducer.js";
import { getUser } from "./redux/api/userAPI.js";
import { BiCloudLightning } from "react-icons/bi";
import ProtectedRoute from "./components/Protected-route.jsx";
import OrderDetails from "./pages/Order-detail.jsx";
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const Notfound = lazy(() => import("./pages/Not-found.jsx"));

// Admin routes
const Productmanagement = lazy(() =>
  import("./pages/admin/management/productmanagement")
);
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const Stopwatch = lazy(() => import("./pages/admin/apps/stopwatch"));
const Toss = lazy(() => import("./pages/admin/apps/toss"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));
const TransactionManagement = lazy(() =>
  import("./pages/admin/management/transactionmanagement")
);

function App() {
  const { user, loading } = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  console.log(user);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await getUser(user.uid);
        // console.log(data);
        dispatch(userExist(data));
      } else {
        dispatch(userNotExist());
      }
    });
  }, []);


  return loading ? (
    <Loader />
  ) : (
    <>
      <Suspense fallback={<Loader />}>
        <Header user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />

          {/* Not logged in route */}
          <Route
            path="/login"
            element={
              <ProtectedRoute isAuthenticated={user ? false : true}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Loged In user routes */}
          <Route
            element={<ProtectedRoute isAuthenticated={user ? true : false} />}
          >
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/pay" element={<Checkout />} />
          </Route>

          {/*Admin routes  */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin"}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/product"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customer"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transaction"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Transaction />
              </ProtectedRoute>
            }
          />
          {/* Charts */}
          <Route
            path="/admin/chart/bar"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Barcharts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chart/pie"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Piecharts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chart/line"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Linecharts />
              </ProtectedRoute>
            }
          />
          {/* Apps */}
          <Route
            path="/admin/app/coupon"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Coupon />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/app/stopwatch"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Stopwatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/app/toss"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Toss />
              </ProtectedRoute>
            }
          />

          {/* Management */}
          <Route
            path="/admin/product/new"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <NewProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/product/:id"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <Productmanagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/transaction/:id"
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminOnly={true}
                admin={user?.role === "admin" ? true : false}
              >
                <TransactionManagement />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </Suspense>
      <Toaster position="bottom-center" />
    </>
  );
}

export default App;
