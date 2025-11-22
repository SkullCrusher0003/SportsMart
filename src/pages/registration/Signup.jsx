import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import myContext from '../../context/data/myContext';
import { LocationContext } from '../../context/location/LocationContext';
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import Loader from '../../components/loader/Loader';
import LocationPicker from '../../components/location/LocationPicker';

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [userType, setUserType] = useState("customer");
    const [location, setLocation] = useState(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const context = useContext(myContext);
    const { loading, setLoading } = context;
    
    const { userLocation } = useContext(LocationContext);
    const navigate = useNavigate();

    const handleLocationSelect = (selectedLocation) => {
        setLocation(selectedLocation);
        setShowLocationPicker(false);
        toast.success('Location selected successfully');
    };

    const signup = async () => {
        setLoading(true);
        
        if (name === "" || email === "" || password === "" || phone === "") {
            setLoading(false);
            return toast.error("All fields are required");
        }

        if (!location) {
            setLoading(false);
            return toast.error("Please select your location");
        }

        try {
            const users = await createUserWithEmailAndPassword(auth, email, password);

            const user = {
                name: name,
                uid: users.user.uid,
                email: users.user.email,
                phone: phone,
                userType: userType,
                location: {
                    lat: location.lat,
                    lng: location.lng,
                    address: location.address
                },
                time: Timestamp.now(),
                date: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                })
            };
            
            const userRef = collection(fireDB, "users");
            await addDoc(userRef, user);
            
            toast.success("Signed Up Successfully");
            
            setName("");
            setEmail("");
            setPassword("");
            setPhone("");
            setLocation(null);
            setUserType("customer");
            setLoading(false);
            
            navigate('/login');
            
        } catch (error) {
            console.log(error);
            
            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            }
            
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className='flex justify-center items-center min-h-screen py-8'>
            {loading && <Loader/>}
            <div className='bg-gray-800 px-10 py-10 rounded-xl w-full max-w-md mx-4'>
                <div className="">
                    <h1 className='text-center text-white text-xl mb-4 font-bold'>Signup</h1>
                </div>

                <div>
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        name='name'
                        className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Name'
                    />
                </div>

                <div>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name='email'
                        className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Email'
                    />
                </div>

                <div>
                    <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        name='phone'
                        className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Phone Number'
                    />
                </div>

                <div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                        placeholder='Password'
                    />
                </div>

                <div>
                    <label className="text-gray-300 text-sm mb-1 block">Account Type</label>
                    <select
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white outline-none'
                    >
                        <option value="customer">Customer</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="retailer">Retailer</option>
                    </select>
                    
                    {/* Info text based on userType */}
                    {userType === 'wholesaler' && (
                        <p className="text-yellow-400 text-xs mb-2">
                            As a wholesaler, you can list products for retailers to purchase.
                        </p>
                    )}
                    {userType === 'retailer' && (
                        <p className="text-blue-400 text-xs mb-2">
                            As a retailer, you can manage your store and inventory.
                        </p>
                    )}
                </div>

                {/* Location Selection */}
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setShowLocationPicker(!showLocationPicker)}
                        className='bg-gray-600 w-full px-2 py-2 rounded-lg text-white hover:bg-gray-700'
                    >
                        {location ? '📍 Location Selected' : '📍 Select Your Location'}
                    </button>
                    {location && (
                        <p className="text-green-400 text-sm mt-2">
                            ✓ {location.address}
                        </p>
                    )}
                </div>

                {showLocationPicker && (
                    <div className="mb-4 bg-white p-4 rounded-lg">
                        <LocationPicker onLocationSelect={handleLocationSelect} />
                    </div>
                )}

                <div className='flex justify-center mb-3'>
                    <button
                        onClick={signup}
                        className='bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg hover:bg-yellow-600 transition-colors'>
                        Signup
                    </button>
                </div>

                <div>
                    <h2 className='text-white'>Have an account? <Link className='text-yellow-500 font-bold' to={'/login'}>Login</Link></h2>
                </div>
            </div>
        </div>
    );
}

export default Signup;
