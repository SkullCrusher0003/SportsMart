import { Link } from 'react-router-dom'
import myContext from '../../context/data/myContext';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { auth, fireDB, googleProvider } from '../../firebase/FirebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { 
  collection, query, where, getDocs, 
  doc, getDoc, setDoc, Timestamp 
} from 'firebase/firestore';
import Loader from '../../components/loader/Loader';
import { FcGoogle } from "react-icons/fc";

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const context = useContext(myContext);
  const { loading, setLoading } = context;

  // Enter key shortcut
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') signin();
  };

  // ---------------- EMAIL LOGIN ----------------
  const signin = async () => {
    if (email === '' || password === '') {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // FETCH USER DATA FROM FIRESTORE
      const usersRef = collection(fireDB, "users");
      const q = query(usersRef, where("uid", "==", result.user.uid));
      const querySnapshot = await getDocs(q);

      let userData = {
        uid: result.user.uid,
        email: result.user.email,
        userType: "customer",
      };

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        userData = { ...userData, ...docData };
      }

      // STORE TOKEN FOR CALENDAR INTEGRATION
      userData.token = result.user.accessToken;

      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Signed In Successfully");

      setLoading(false);

      // REDIRECT BASED ON USERTYPE
      setTimeout(() => {
        if (userData.userType === "wholesaler") {
          window.location.href = "/wholesaler-dashboard";
        } else if (
          userData.userType === "retailer" ||
          userData.userType === "admin"
        ) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/";
        }
      }, 800);

    } catch (error) {
      console.error(error);

      let message = "Sign In Failed";

      if (error.code === "auth/user-not-found") message = "No account exists";
      if (error.code === "auth/wrong-password") message = "Incorrect password";
      if (error.code === "auth/invalid-email") message = "Invalid email";
      if (error.code === "auth/too-many-requests") message = "Too many attempts";

      toast.error(message);
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // CHECK USER IN FIRESTORE
      const usersRef = collection(fireDB, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const snap = await getDocs(q);

      let userType = "customer", name = "", phone = "", location = null;

      if (snap.empty) {
        await setDoc(doc(fireDB, "users", user.uid), {
          name: user.displayName || "",
          email: user.email,
          uid: user.uid,
          userType: "customer",
          phone: "",
          location: null,
          time: Timestamp.now(),

          lastSearch: "",
          lastCategory: "",
          lastUpdated: Timestamp.now()
        });
      } else {
        const d = snap.docs[0].data();
        userType = d.userType || "customer";
        name = d.name || "";
        phone = d.phone || "";
        location = d.location || null;
      }

      // SAVE TO LOCAL STORAGE WITH TOKEN
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        name,
        phone,
        userType,
        location,
        token: result._tokenResponse.oauthAccessToken,
        provider: "google"
      }));

      toast.success("Login Successful!");

      setTimeout(() => {
        if (userType === "wholesaler") {
          window.location.href = "/wholesaler-dashboard";
        } else if (userType === "retailer" || userType === "admin") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/";
        }
      }, 800);

    } catch (error) {
      console.log(error);
      toast.error("Google Login Failed!");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {loading && <Loader />}
      <div className="bg-gray-800 px-10 py-10 rounded-xl">
        <h1 className="text-center text-white text-xl mb-4 font-bold">Login</h1>

        <input 
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white"
          placeholder="Email"
        />

        <input
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white"
          placeholder="Password"
        />

        <button onClick={signin} className="bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg mb-3">
          Login
        </button>

        <button
          onClick={loginWithGoogle}
          className="bg-white w-full text-black font-bold px-2 py-2 rounded-lg flex items-center justify-center gap-2 shadow hover:bg-gray-200 mb-3"
        >
          <FcGoogle className="text-2xl" /> Continue with Google
        </button>

        <h2 className="text-white">
          Don't have an account?{" "}
          <Link className="text-yellow-500 font-bold" to={"/signup"}>
            Signup
          </Link>
        </h2>
      </div>
    </div>
  );
}

export default Login;