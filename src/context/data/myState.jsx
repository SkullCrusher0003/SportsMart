import React, { useEffect, useState } from 'react'
import MyContext from './myContext';
import { fireDB } from '../../firebase/FirebaseConfig';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';


function MyState(props) {
  const [mode, setMode] = useState('light');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
      document.body.style.backgroundColor = 'rgb(17, 24, 39)';
    }
    else {
      setMode('light');
      document.body.style.backgroundColor = 'white';
    }
  }

  const [products, setProducts] = useState({
    title: "",
    price: "",
    imageUrl: "",
    category: "",
    description: "",
    time: Timestamp.now(),
    date: new Date().toLocaleString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    )

  })

  // ********************** Add Product Section  **********************
  const addProduct = async () => {
    if (products.title == null || products.price == null || products.imageUrl == null || products.category == null || products.description == null) {
      return toast.error('Please fill all fields')
    }
    const productRef = collection(fireDB, "products")
    setLoading(true)
    try {
      await addDoc(productRef, products)
      toast.success("Product Add successfully")
      setTimeout (() => {
        window.location.href = '/dashboard'
      }, 800);
      getProductData()
      closeModal()
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
    setProducts("")
  }

  const [product, setProduct] = useState([]);

  // ****** get product
  const getProductData = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(fireDB, "products"),
        orderBy("time"),
        // limit(5)
      );
      const data = onSnapshot(q, (QuerySnapshot) => {
        let productsArray = [];
        QuerySnapshot.forEach((doc) => {
          productsArray.push({ ...doc.data(), id: doc.id });
        });
        setProduct(productsArray)
        setLoading(false);
      });
      return () => data;
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }


  const edithandle = (item) => {
    setProducts(item)
  }
  // update product
  const updateProduct = async (item) => {
    setLoading(true)
    try {
      await setDoc(doc(fireDB, "products", products.id), products);
      toast.success("Product Updated successfully")
      getProductData();
      setLoading(false)
      window.location.href = '/dashboard'
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
    setProducts("")
  }

  const deleteProduct = async (item) => {

    try {
      setLoading(true)
      await deleteDoc(doc(fireDB, "products", item.id));
      toast.success('Product Deleted successfully')
      setLoading(false)
      getProductData()
    } catch (error) {
      // toast.success('Product Deleted Falied')
      setLoading(false)
    }
  }


  const [order, setOrder] = useState([]);

  const getOrderData = async () => {
    setLoading(true)
    try {
      const result = await getDocs(collection(fireDB, "orders"))
      const ordersArray = [];
      result.forEach((docItem) => {
        ordersArray.push({id: docItem.id, ...docItem.data()});
        setLoading(false)
      });
      setOrder(ordersArray);
      setLoading(false);
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(fireDB, "orders", orderId), {
        orderStatus: newStatus
      });
      toast.success("Order Status Updated!");
      getOrderData();
    } 
    catch (error) {
      console.log(error)
      toast.error("Failed to Update Status");
    }
  }

  const [user, setUser] = useState([]);

  const getUserData = async () => {
    setLoading(true)
    try {
      const result = await getDocs(collection(fireDB, "users"))
      const usersArray = [];
      result.forEach((doc) => {
        usersArray.push(doc.data());
        setLoading(false)
      });
      setUser(usersArray);
      console.log(usersArray)
      setLoading(false);
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  const [searchkey, setSearchkey] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterPrice, setFilterPrice] = useState('')

  // Personalisation
  const [userPreferences, setUserPreferences] = useState({
    lastSearch: "",
    lastCategory: ""
  });
  const saveUserPreferences = async ({ lastSearch, lastCategory } = {}) => {
    try {
        const raw = localStorage.getItem("user");
        if (!raw) return;

        const u = JSON.parse(raw).user;
        if (!u || !u.uid) return;

        const ref = doc(fireDB, "users", u.uid);

        const current = userPreferences;

        // Avoid overwriting with empty strings
        const updatedPrefs = {
            lastSearch: lastSearch?.trim() !== "" ? lastSearch : current.lastSearch,
            lastCategory: lastCategory?.trim() !== "" ? lastCategory : current.lastCategory
        };

        // If no actual change, do not update Firestore
        if (
            updatedPrefs.lastSearch === current.lastSearch &&
            updatedPrefs.lastCategory === current.lastCategory
        ) {
            return;
        }

        await updateDoc(ref, {
            ...updatedPrefs,
            lastUpdated: Timestamp.now()
        });

        // Save to local state
        setUserPreferences(updatedPrefs);

    } catch (err) {
        console.error("Error saving user preferences:", err);
    }
  }; 
  const loadUserPreferences = async () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      const u = JSON.parse(raw).user;
      if (!u || !u.uid) return;

      const ref = doc(fireDB, "users", u.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setUserPreferences({
          lastSearch: data.lastSearch,
          lastCategory: data.lastCategory
        });
      }
    } catch (err) {
      console.error(err);
    }
  };


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
      products, setProducts, addProduct, product, updateProduct, edithandle, deleteProduct, 
      order, user, updateOrderStatus,
      searchkey, setSearchkey, filterType, setFilterType, filterPrice, setFilterPrice,
      userPreferences, setUserPreferences, saveUserPreferences, loadUserPreferences,
    }}>
      {props.children}
    </MyContext.Provider>
  )
}

export default MyState