import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import myContext from "../../context/data/myContext";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, fireDB } from "../../firebase/FirebaseConfig";
import { Timestamp, setDoc, doc } from "firebase/firestore";
import Loader from "../../components/loader/Loader";
import LocationPicker from "../../components/location/LocationPicker";
import emailjs from "@emailjs/browser";

function Signup() {
  // BASIC FIELDS
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // New fields from teammates
  const [userType, setUserType] = useState("customer");
  const [location, setLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // OTP STATES
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  const { loading, setLoading } = useContext(myContext);
  const navigate = useNavigate();

  // 📌 SEND OTP
  const sendOTP = async () => {
    if (!email.trim()) return toast.error("Please enter a valid email first.");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    const expiry = new Date(Date.now() + 15 * 60000).toLocaleTimeString();

    try {
      setLoading(true);
      await emailjs.send(
        "service_wq5k3l8",
        "template_gla4fmd",
        {
          to_email: email,
          otp_code: otp,
          time: expiry,
        },
        "NzEEdJq8g6Ep5mSAZ"
      );

      toast.success("OTP sent.");
      setOtpSent(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to send OTP.");
    }

    setLoading(false);
  };

  // 📌 LOCATION SELECT
  const handleLocationSelect = (selected) => {
    setLocation(selected);
    setShowLocationPicker(false);
    toast.success("Location selected successfully");
  };

  // 📌 FINAL SIGNUP
  const signup = async () => {
    if (!name || !email || !password || !phone)
      return toast.error("All fields are required");

    if (!location) return toast.error("Please select your location");

    if (!otpSent) return toast.error("Please verify OTP before signup");

    if (enteredOtp !== generatedOtp) return toast.error("Invalid OTP!");

    try {
      setLoading(true);

      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Create final user object
      const userObj = {
        name,
        email,
        phone,
        uid: res.user.uid,
        userType,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        },
        time: Timestamp.now(),
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),

        // PERSONALISATION FIELDS (yours)
        lastSearch: "",
        lastCategory: "",
        lastUpdated: Timestamp.now(),
      };

      await setDoc(doc(fireDB, "users", res.user.uid), userObj);

      toast.success("Signed up successfully!");

      navigate("/login");
    } catch (err) {
      console.log(err);

      let msg = "Signup failed";

      if (err.code === "auth/email-already-in-use")
        msg = "Email already registered";
      else if (err.code === "auth/invalid-email") msg = "Invalid email";
      else if (err.code === "auth/weak-password")
        msg = "Password must be at least 6 characters";

      toast.error(msg);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-8">
      {loading && <Loader />}

      <div className="bg-gray-800 px-10 py-10 rounded-xl w-full max-w-md mx-4">
        <h1 className="text-center text-white text-xl mb-4 font-bold">
          Signup
        </h1>

        {/* NAME */}
        <input
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white outline-none"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* EMAIL */}
        <input
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PHONE */}
        <input
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white outline-none"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* USER TYPE SELECT */}
        <label className="text-gray-300 text-sm mb-1 block">
          Account Type
        </label>
        <select
          className="bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="customer">Customer</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="retailer">Retailer</option>
        </select>

        {userType === "wholesaler" && (
          <p className="text-yellow-400 text-xs mb-2">
            As a wholesaler, you can list products for retailers.
          </p>
        )}

        {userType === "retailer" && (
          <p className="text-blue-400 text-xs mb-2">
            As a retailer, you can manage store & inventory.
          </p>
        )}

        {/* LOCATION SELECT */}
        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          className="bg-gray-600 w-full px-2 py-2 rounded-lg text-white"
        >
          {location ? "📍 Location Selected" : "📍 Select Your Location"}
        </button>

        {location && (
          <p className="text-green-400 text-sm mt-2">✓ {location.address}</p>
        )}

        {showLocationPicker && (
          <div className="bg-white p-4 rounded-lg mt-3">
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>
        )}

        {/* OTP BUTTON */}
        <button
          onClick={sendOTP}
          disabled={otpSent}
          className={`bg-blue-500 text-white mt-4 font-bold px-3 py-2 rounded-lg w-full ${
            otpSent ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Send OTP
        </button>

        {/* OTP INPUT */}
        {otpSent && (
          <input
            className="bg-gray-600 mt-4 px-2 py-2 w-full rounded-lg text-white outline-none"
            placeholder="Enter OTP"
            value={enteredOtp}
            onChange={(e) => setEnteredOtp(e.target.value)}
          />
        )}

        {/* SIGNUP BUTTON */}
        <button
          onClick={signup}
          className="bg-yellow-500 mt-5 w-full text-black font-bold px-2 py-2 rounded-lg"
        >
          Signup
        </button>

        <p className="text-white text-center mt-4">
          Have an account?{" "}
          <Link className="text-yellow-500 font-bold" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;