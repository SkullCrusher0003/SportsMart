import React, { useContext, useEffect, useState } from 'react'
import myContext from '../../context/data/myContext'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { addToCart } from '../../redux/cartSlice'

function ProductCard() {
    const context = useContext(myContext);
    const { mode, product, userPreferences } = context;
    const userType = JSON.parse(localStorage.getItem("user"))?.userType || "customer";

    const dispatch = useDispatch();

    /* ---------------- PERSONALISATION SORT ---------------- */
    const lastSearch = userPreferences.lastSearch.toLowerCase();
    const lastCategory = userPreferences.lastCategory.toLowerCase();

    const personalisedList = [...product].sort((a, b) => {
        let aScore = 0, bScore = 0;

        if (lastSearch) {
            if (a.title.toLowerCase().includes(lastSearch)) aScore += 2;
            if (b.title.toLowerCase().includes(lastSearch)) bScore += 2;
        }
        if (lastCategory) {
            if (a.category.toLowerCase() === lastCategory) aScore += 1;
            if (b.category.toLowerCase() === lastCategory) bScore += 1;
        }
        return bScore - aScore;
    });

    /* -------------------- ADD TO CART -------------------- */
    const addCart = (item, e) => {
        e.stopPropagation();
        dispatch(addToCart({ ...item, quantity: 1 }));
        toast.success("Added 1 Item");
    };

    return (
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-8 md:py-16 mx-auto">

                {/* Section Title */}
                <div className="lg:w-1/2 w-full mb-6 lg:mb-10">
                    <h1 className="sm:text-3xl text-2xl font-medium mb-2"
                        style={{ color: mode === 'dark' ? 'white' : '' }}>
                        Recommended For You
                    </h1>
                    <div className="h-1 w-20 bg-pink-600 rounded"></div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {personalisedList.slice(0, 4).map(item => (
                        <div
                            key={item.id}
                            className="p-4 cursor-pointer drop-shadow-lg"
                            onClick={() => window.location.href = `/productinfo/${item.id}`}
                        >

                            <div
                                className="h-full border-2 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-gray-300 transition-shadow duration-300"
                                style={{
                                    backgroundColor: mode === 'dark' ? 'rgb(46,49,55)' : '',
                                    color: mode === 'dark' ? 'white' : ''
                                }}
                            >

                                {/* Square image */}
                                <div className="w-full aspect-square overflow-hidden p-2">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover rounded-2xl 
                                        transition-transform duration-300 hover:scale-105"
                                    />
                                </div>

                                <div className="p-5 border-t-2">

                                    {/* CATEGORY */}
                                    <h2
                                        className="tracking-widest text-xs font-medium mb-1"
                                        style={{ color: mode === 'dark' ? '#d1d5db' : '#6b7280' }}
                                    >
                                        {item.category}
                                    </h2>

                                    {/* TITLE */}
                                    <h1 className="text-lg font-medium mb-3"
                                        style={{ color: mode === 'dark' ? 'white' : '' }}>
                                        {item.title}
                                    </h1>

                                    {/* PRICE */}
                                    <p className="mb-3"
                                        style={{ color: mode === 'dark' ? 'white' : '' }}>
                                        ₹ {item.price}
                                    </p>

                                    {/* Add to Cart */}
                                    <button
                                        disabled={userType === "wholesaler"}
                                        onClick={(e) => addCart(item, e)}
                                        className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors duration-200"
                                    >
                                        Add To Cart
                                    </button>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}

export default ProductCard;