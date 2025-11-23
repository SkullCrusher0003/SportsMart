import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import myContext from '../../context/data/myContext';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc, collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { addToCart } from '../../redux/cartSlice';
import { fireDB } from '../../firebase/FirebaseConfig';

function ProductInfo() {
    const context = useContext(myContext);
    const { loading, setLoading, mode } = context;
    const userType = JSON.parse(localStorage.getItem("user"))?.userType || "customer";

    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState('');
    const params = useParams();

    // Calculate average rating
    const averageRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const getProductData = async () => {
        setLoading(true);
        try {
            const productTemp = await getDoc(doc(fireDB, "products", params.id));
            setProducts(productTemp.data());
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getProductData();
    }, []);

    // Fetch product reviews
    useEffect(() => {
        if (!params.id) return;

        const q = query(
            collection(fireDB, "products", params.id, "reviews"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const arr = [];
            snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
            setReviews(arr);
        });

        return () => unsubscribe();
    }, [params.id]);

    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    const addCart = (products) => {
        dispatch(addToCart(products));
        toast.success('Added to cart');
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    return (
        <Layout>
            <section className="body-font overflow-hidden"
                style={{ backgroundColor: mode === "dark" ? "#0f172a" : "white" }}>

                <div className="container px-5 py-10 mx-auto">
                    {products &&
                        <div className="lg:w-4/5 mx-auto flex flex-wrap">

                            {/* Product Image */}
                            <img
                                alt="ecommerce"
                                className="lg:w-1/3 w-full lg:h-auto object-cover object-center rounded"
                                src={products.imageUrl}
                            />

                            {/* Product Info */}
                            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">

                                {/* Category */}
                                <h2
                                    className="text-sm tracking-widest"
                                    style={{ color: mode === "dark" ? "#9ca3af" : "#6b7280" }}
                                >
                                    {products.category}
                                </h2>

                                {/* Title */}
                                <h1
                                    className="text-3xl font-medium mb-1"
                                    style={{ color: mode === "dark" ? "white" : "#111827" }}
                                >
                                    {products.title}
                                </h1>

                                {/* Rating + Count */}
                                <div className="flex items-center mb-4">

                                    {/* Dynamic Stars */}
                                    <span className="text-yellow-500 flex text-lg">
                                        {"★".repeat(Math.round(averageRating))}
                                        {"☆".repeat(5 - Math.round(averageRating))}
                                    </span>

                                    {/* Review Count */}
                                    <span
                                        className="ml-3"
                                        style={{ color: mode === "dark" ? "#cbd5e1" : "#4b5563" }}
                                    >
                                        {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
                                    </span>

                                </div>

                                {/* Description */}
                                <p
                                    className="leading-relaxed mb-5 pb-5 border-b"
                                    style={{
                                        color: mode === "dark" ? "#d1d5db" : "#374151",
                                        borderColor: mode === "dark" ? "#334155" : "#e5e7eb"
                                    }}
                                >
                                    {products.description}
                                </p>

                                {/* Price + Add to Cart */}
                                <div className="flex items-center">
                                    <span
                                        className="title-font font-medium text-2xl"
                                        style={{ color: mode === "dark" ? "white" : "#111827" }}
                                    >
                                        ₹{products.price}
                                    </span>

                                    <button
                                        disabled={userType === "wholesaler"}
                                        onClick={() => addCart(products)}
                                        className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6
                                        focus:outline-none hover:bg-indigo-600 rounded"
                                    >
                                        Add To Cart
                                    </button>

                                    <button className="rounded-full w-10 h-10 bg-gray-200 dark:bg-gray-700
                                        border-0 inline-flex items-center justify-center text-gray-500 ml-4">
                                        <svg
                                            fill="currentColor"
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>}
                </div>
            </section>

            {/* ------------------- REVIEWS SECTION ------------------- */}
            <div className="mt-10 lg:w-3/5 mx-auto">

                {/* Heading */}
                <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: mode === "dark" ? "white" : "black" }}
                >
                    Customer Reviews
                </h2>

                {/* If No Reviews */}
                {reviews.length === 0 && (
                    <p style={{ color: mode === "dark" ? "#cbd5e1" : "#6b7280" }}>
                        No reviews yet. Be the first to review after purchase.
                    </p>
                )}

                {/* Review Cards */}
                {reviews.map((rev) => (
                    <div
                        key={rev.id}
                        className="border p-4 rounded mb-3 shadow"
                        style={{
                            backgroundColor: mode === "dark" ? "#1e293b" : "white",
                            color: mode === "dark" ? "#f1f5f9" : "#111827",
                            borderColor: mode === "dark" ? "#334155" : "#e5e7eb"
                        }}
                    >
                        {/* Username + Stars */}
                        <div className="flex items-center mb-2">
                            <span className="font-semibold mr-3">{rev.username}</span>
                            <span className="text-yellow-500">
                                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                            </span>
                        </div>

                        {/* Comment */}
                        <p
                            style={{
                                color: mode === "dark" ? "#e2e8f0" : "#374151"
                            }}
                            className="mb-1"
                        >
                            {rev.comment}
                        </p>

                        {/* Date */}
                        <small
                            style={{
                                color: mode === "dark" ? "#94a3b8" : "#6b7280"
                            }}
                        >
                            {rev.createdAt?.seconds
                                ? new Date(rev.createdAt.seconds * 1000).toLocaleString()
                                : ""}
                        </small>
                    </div>
                ))}

            </div>
        </Layout>
    );
}

export default ProductInfo;