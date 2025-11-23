import React, { useEffect, useState } from 'react'
import MyContext from './myContext';
import { fireDB } from '../../firebase/FirebaseConfig';
import {
  Timestamp, addDoc, collection, deleteDoc, doc, getDocs, getDoc,
  onSnapshot, orderBy, query, setDoc, updateDoc
} from 'firebase/firestore';
import { toast } from 'react-toastify';

function MyState(props) {

  /* -------------------------- THEME MODE -------------------------- */
  const [mode, setMode] = useState('light');
  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    document.body.style.backgroundColor = newMode === 'dark'
      ? 'rgb(17, 24, 39)'
      : 'white';
  }

  const [loading, setLoading] = useState(false);

  /* ------------------------ PRODUCT STATE ------------------------- */
  const [products, setProducts] = useState({
    title: "",
    price: "",
    imageUrl: "",
    category: "",
    description: "",
    quantity: "",
    moq: "",
    time: Timestamp.now(),
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
  });

  /* ------------------------- ADD PRODUCT -------------------------- */
  const addProduct = async () => {
    if (!products.title || !products.price || !products.imageUrl || !products.category || !products.description) {
      return toast.error("Please fill all fields");
    }

    const productRef = collection(fireDB, "products");

    try {
      setLoading(true);
      await addDoc(productRef, products);
      toast.success("Product Added Successfully");

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const email = user?.user?.email;

      setTimeout(() => {
        if (email === "arnavgupta5107@gmail.com") {
          window.location.href = "/wholesaler-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }, 800);

      getProductData();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add product");
    }

    setLoading(false);
    setProducts({
      title: "",
      price: "",
      imageUrl: "",
      category: "",
      description: "",
      quantity: "",
      moq: "",
      time: Timestamp.now(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    });
  };

  /* --------------------------- FETCH PRODUCTS --------------------------- */
  const [product, setProduct] = useState([]);

  const getProductData = async () => {
    try {
      setLoading(true);
      const q = query(collection(fireDB, "products"), orderBy("time"));
      const unsub = onSnapshot(q, (snapshot) => {
        const arr = [];
        snapshot.forEach((doc) => arr.push({ ...doc.data(), id: doc.id }));
        setProduct(arr);
        setLoading(false);
      });
      return () => unsub();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const edithandle = (item) => setProducts(item);

  /* ------------------------- UPDATE PRODUCT --------------------------- */
  const updateProduct = async () => {
    try {
      setLoading(true);
      await setDoc(doc(fireDB, "products", products.id), products);
      toast.success("Product Updated Successfully");

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const email = user?.user?.email;

      if (email === "arnavgupta5107@gmail.com") {
        window.location.href = "/wholesaler-dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    }
    setLoading(false);
  };

  const deleteProduct = async (item) => {
    try {
      setLoading(true);
      await deleteDoc(doc(fireDB, "products", item.id));
      toast.success("Product Deleted");
      getProductData();
    } catch (error) {
      toast.error("Deletion Failed");
    }
    setLoading(false);
  };

  /* ------------------------------ ORDERS ------------------------------ */
  const [order, setOrder] = useState([]);

  const getOrderData = async () => {
    try {
      setLoading(true);
      const result = await getDocs(collection(fireDB, "orders"));
      const arr = [];
      result.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setOrder(arr);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(fireDB, "orders", orderId), { orderStatus: newStatus });
      toast.success("Order Status Updated!");
      getOrderData();
    } catch {
      toast.error("Failed to Update Status");
    }
  };

  /* ------------------------------ USERS ------------------------------- */
  const [user, setUser] = useState([]);

  const getUserData = async () => {
    try {
      setLoading(true);
      const result = await getDocs(collection(fireDB, "users"));
      const arr = [];
      result.forEach(doc => arr.push(doc.data()));
      setUser(arr);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  /* -------------------------- PERSONALISATION -------------------------- */
  const [userPreferences, setUserPreferences] = useState({
    lastSearch: "",
    lastCategory: ""
  });

  const saveUserPreferences = async ({ lastSearch, lastCategory } = {}) => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const u = JSON.parse(raw).user;
      if (!u?.uid) return;

      const ref = doc(fireDB, "users", u.uid);

      const current = userPreferences;

      const updated = {
        lastSearch: lastSearch?.trim() || current.lastSearch,
        lastCategory: lastCategory?.trim() || current.lastCategory,
      };

      if (
        updated.lastSearch === current.lastSearch &&
        updated.lastCategory === current.lastCategory
      ) return;

      await updateDoc(ref, {
        ...updated,
        lastUpdated: Timestamp.now(),
      });

      setUserPreferences(updated);

    } catch (err) {
      console.error("personalisation error:", err);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const u = JSON.parse(raw).user;
      if (!u?.uid) return;

      const snap = await getDoc(doc(fireDB, "users", u.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserPreferences({
          lastSearch: data.lastSearch || "",
          lastCategory: data.lastCategory || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ------------------------------ FILTERS ------------------------------- */
  const [searchkey, setSearchkey] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  /* ------------------------------ INIT ------------------------------- */
  useEffect(() => {
    getProductData();
    getOrderData();
    getUserData();
    loadUserPreferences();
  }, []);

  return (
    <MyContext.Provider value={{
      mode, toggleMode,
      loading, setLoading,
      products, setProducts, addProduct, product,
      updateProduct, edithandle, deleteProduct,
      order, user, updateOrderStatus,

      searchkey, setSearchkey,
      filterType, setFilterType,
      filterPrice, setFilterPrice,

      userPreferences, saveUserPreferences, loadUserPreferences,
    }}>
      {props.children}
    </MyContext.Provider>
  )
}

export default MyState;