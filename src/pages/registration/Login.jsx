import { Link } from 'react-router-dom'
import myContext from '../../context/data/myContext';
import { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Loader from '../../components/loader/Loader';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const context = useContext(myContext);
    const { loading, setLoading } = context;

    const signin = async () => {
        if (email === '' || password === '') {
            toast.error('All fields are required', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
            return;
        }

        setLoading(true);
        
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            
            // Fetch user data from Firestore to get userType
            const usersRef = collection(fireDB, "users");
            const q = query(usersRef, where("uid", "==", result.user.uid));
            const querySnapshot = await getDocs(q);
            
            let userData = {
                uid: result.user.uid,
                email: result.user.email,
                userType: 'customer' // Default to customer if not found
            };
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                userData = {
                    uid: result.user.uid,
                    email: result.user.email,
                    name: userDoc.name,
                    phone: userDoc.phone,
                    userType: userDoc.userType || 'customer',
                    location: userDoc.location || null
                };
            }
            
            // Store complete user data in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            
            toast.success('Signed In Successfully', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });

            setLoading(false);
            
            // Redirect based on userType
            setTimeout(() => {
                if (userData.userType === 'wholesaler') {
                    window.location.href = '/wholesaler-dashboard';
                } else if (userData.userType === 'retailer' || userData.userType === 'admin') {
                    window.location.href = '/dashboard';
                } else {
                    window.location.href = '/';
                }
            }, 800);
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Sign In Failed';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later';
            }
            
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
            
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            signin();
        }
    };
   
    return (
        <div className='flex justify-center items-center h-screen'>
            {loading && <Loader />}
            <div className='bg-gray-800 px-10 py-10 rounded-xl'>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>Login</h1>
                </div>
                <div>
                    <input 
                        type="email"
                        name='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className='bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none focus:ring-2 focus:ring-yellow-500'
                        placeholder='Email'
                    />
                </div>
                <div>
                    <input
                        type="password"
                        name='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className='bg-gray-600 mb-4 px-2 py-2 w-full lg:w-[20em] rounded-lg text-white placeholder:text-gray-200 outline-none focus:ring-2 focus:ring-yellow-500'
                        placeholder='Password'
                    />
                </div>
                <div className='flex justify-center mb-3'>
                    <button
                        onClick={signin}
                        className='bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg hover:bg-yellow-600 transition-colors'
                    >
                        Login
                    </button>
                </div>
                <div>
                    <h2 className='text-white'>Don't have an account <Link className='text-yellow-500 font-bold hover:underline' to={'/signup'}>Signup</Link></h2>
                </div>
            </div>
        </div>
    );
}

export default Login;
