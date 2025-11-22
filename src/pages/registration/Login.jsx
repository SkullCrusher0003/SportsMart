import { Link } from 'react-router-dom'
import myContext from '../../context/data/myContext';
import { useContext, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { auth, fireDB, googleProvider } from '../../firebase/FirebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import Loader from '../../components/loader/Loader';
import { LiaSteamSquare } from 'react-icons/lia';
import { FcGoogle } from "react-icons/fc";

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const context = useContext(myContext)
    const { loading,setLoading} = context

    // Email and Password
    const signin = async () => {
      setLoading(true);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        localStorage.setItem('user',JSON.stringify(result));
        toast.success('Signed In Successfully', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });

        setTimeout (() => {
        window.location.href = '/'
      }, 800);
        setLoading(false);
      } catch (error) {
        toast.error('Sign In Failed', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setLoading(false);
      }
    }

    // Google Login
    const loginWithGoogle = async () => {
      try {
        setLoading(true);

        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Checking Existence of User
        const userRef = doc(fireDB, "users", user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            name: user.displayName || "",
            email: user.email,
            uid: user.uid,
            time: Timestamp.now(),

            lastSearch: "",
            lastCategory: "",
            lastUpdated: Timestamp.now()
          })
        }
        localStorage.setItem("user", JSON.stringify({
          user: user,
          token: result._tokenResponse.oauthAccessToken,
          provider: "google"
        }));

        toast.success("Login Successful!");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      }
      catch (error) {
        console.log(error);
        toast.error("Google Login Failed!");
      }
      setLoading(false);
    }
   
    return (
        <div className=' flex justify-center items-center h-screen'>
            {loading && <Loader/>}
            <div className=' bg-gray-800 px-10 py-10 rounded-xl '>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>Login</h1>
                </div>
                <div>
                    <input type="email"
                        name='email'
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        className=' bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Email'
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        className=' bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Password'
                    />
                </div>
                <div className=' flex justify-center mb-3'>
                    <button
                    onClick={signin}
                        className=' bg-yellow-500 w-full text-black font-bold  px-2 py-2 rounded-lg'>
                        Login
                    </button>
                </div>
                <div className='flex justify-center mb-3'>
                    <button
                        onClick={loginWithGoogle }
                        className=' bg-white w-full text-black font-bold px-2 py-2 rounded-lg flex items-center justify-center gap-2 shadow hover:bg-gray-200'>
                        <FcGoogle className='text-2xl' />
                        Continue with Google
                    </button>
                </div>
                <div>
                    <h2 className='text-white'>Don't have an account? <Link className=' text-yellow-500 font-bold' to={'/signup'}>Signup</Link></h2>
                </div>
            </div>
        </div>
    )
}

export default Login