import { Fragment, useContext, useState } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Link } from "react-router-dom";
import { BsFillCloudSunFill } from "react-icons/bs";
import { FiSun } from "react-icons/fi";
import myContext from "../../context/data/myContext";
import { RxCross2 } from "react-icons/rx";
import { useSelector } from "react-redux";
import { FaCartShopping } from "react-icons/fa6";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { toggleMode, mode } = useContext(myContext);

  // Better unified user fetch from teammates' version
  const getStorageItem = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  const user = getStorageItem("user");
  const admin = getStorageItem("admin");
  const wholesaler = getStorageItem("wholesaler");

  const loggedEmail =
    admin?.email ||
    admin?.user?.email ||
    wholesaler?.email ||
    wholesaler?.user?.email ||
    user?.email ||
    user?.user?.email;

  // Role-based dashboard logic (from teammates’ version)
  const dashboardLink =
    loggedEmail === "testretailer@gmail.com"
      ? "/dashboard"
      : loggedEmail === "arnavgupta5107@gmail.com"
      ? "/wholesaler-dashboard"
      : null;

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentAdmin");
    localStorage.removeItem("currentWholesaler");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("wholesaler");
    window.location.href = "/";
  };

  const cartItems = useSelector((state) => state.cart);

  return (
    <div className="bg-white sticky top-0 z-50">

      {/* ---------------- MOBILE MENU ---------------- */}
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>

          {/* BACKDROP */}
          <TransitionChild
            enter="duration-300 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </TransitionChild>

          {/* PANEL */}
          <TransitionChild
            enter="duration-300 transform ease-out"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="duration-200 transform ease-in"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel
              className="fixed inset-y-0 left-0 w-64 p-6 shadow-xl flex flex-col"
              style={{
                backgroundColor: mode === "dark" ? "rgb(40,44,52)" : "white",
                color: mode === "dark" ? "white" : "black",
              }}
            >
              {/* CLOSE BUTTON */}
              <button
                className="self-end mb-6 p-2 text-xl"
                onClick={() => setOpen(false)}
              >
                <RxCross2 />
              </button>

              {/* STYLISH LINE */}
              <div className="mb-6">
                <div className="h-1 w-16 bg-pink-600 rounded mt-1"></div>
              </div>

              {/* MOBILE LINKS */}
              <nav className="flex flex-col gap-5 text-lg mt-2">
                <Link to="/allproducts" onClick={() => setOpen(false)}>All Products</Link>

                <Link to="/order" onClick={() => setOpen(false)}>Order</Link>

                {dashboardLink && (
                  <Link to={dashboardLink} onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                )}

                {user || admin || wholesaler ? (
                  <p className="cursor-pointer" onClick={logout}>Logout</p>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                )}
              </nav>

              {/* MOBILE FOOTER — THEME + CART */}
              <div className="mt-auto pt-10 flex items-center justify-between">

                {/* THEME SWITCH */}
                <button onClick={toggleMode}>
                  {mode === "light" ? (
                    <FiSun size={28} />
                  ) : (
                    <BsFillCloudSunFill size={28} />
                  )}
                </button>

                {/* CART */}
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2"
                >
                  <FaCartShopping size={22} />
                  Cart ({cartItems.length})
                </Link>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      {/* ---------------- DESKTOP NAVBAR ---------------- */}
      <header className="bg-white">
        <nav
          className="bg-gray-100 shadow px-4 sm:px-6 lg:px-8"
          style={{
            backgroundColor: mode === "dark" ? "#282c34" : "",
            color: mode === "dark" ? "white" : "",
          }}
        >
          <div className="flex items-center h-16">

            {/* MOBILE MENU BUTTON */}
            <button
              className="lg:hidden p-2 rounded-md"
              onClick={() => setOpen(true)}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* LOGO */}
            <Link to="/" className="ml-4">
              <h1
                className="text-2xl font-bold"
                style={{ color: mode === "dark" ? "white" : "" }}
              >
                SportsMart
              </h1>
            </Link>

            {/* DESKTOP LINKS */}
            <div className="hidden lg:flex ml-auto items-center gap-8 text-sm font-medium">
              <Link to="/allproducts">All Products</Link>

              <Link to="/order">Order</Link>

              {dashboardLink && <Link to={dashboardLink}>Dashboard</Link>}

              {(user || admin || wholesaler) ? (
                <p className="cursor-pointer" onClick={logout}>Logout</p>
              ) : (
                <Link to="/login">Login</Link>
              )}

              {/* THEME */}
              <button onClick={toggleMode}>
                {mode === "light" ? (
                  <FiSun size={26} />
                ) : (
                  <BsFillCloudSunFill size={26} />
                )}
              </button>

              {/* CART */}
              <Link to="/cart" className="flex items-center gap-2">
                <FaCartShopping size={22} />
                <span>{cartItems.length}</span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}