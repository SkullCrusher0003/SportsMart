import React, { useContext, useEffect, useState } from 'react'
import myContext from '../../context/data/myContext'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { addToCart } from '../../redux/cartSlice'

function ProductCard() {
    const context = useContext(myContext);
    const { mode, product, userPreferences } = context;

    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    /* -------------------- QUANTITY STATE -------------------- */
    const [quantities, setQuantities] = useState({});
    useEffect(() => {
        const q = {};
        product.forEach(item => q[item.id] = 1);
        setQuantities(q);
    }, [product]);

    const changeQty = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    /* -------------------- ADD TO CART -------------------- */
    const addCart = (item, e) => {
        e.stopPropagation();
        const qty = quantities[item.id] || 1;
        dispatch(addToCart({ ...item, quantity: qty }));
        toast.success(`Added ${qty} item(s)`);
        setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    };

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

    return (
        <section className="text-gray-600 body-font">
            <div className="container px-5 py-8 md:py-16 mx-auto">
                <div className="lg:w-1/2 w-full mb-6 lg:mb-10">
                    <h1 className="sm:text-3xl text-2xl font-medium mb-2"
                        style={{ color: mode === 'dark' ? 'white' : '' }}>
                        Recommended For You
                    </h1>
                    <div className="h-1 w-20 bg-pink-600 rounded"></div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start -m-4">
                    {personalisedList.slice(0, 4).map(item => {
                        const qty = quantities[item.id] || 1;
                        return (
                            <div className="p-4 md:w-1/4 drop-shadow-lg" key={item.id}
                                onClick={() => window.location.href = `/productinfo/${item.id}`}>
                                
                                <div className="h-full border-2 rounded-2xl overflow-hidden"
                                    style={{
                                        backgroundColor: mode === 'dark' ? 'rgb(46,49,55)' : '',
                                        color: mode === 'dark' ? 'white' : ''
                                    }}>
                                    
                                    <div className="flex justify-center cursor-pointer">
                                        <img className="rounded-2xl w-full h-80 p-2"
                                             src={item.imageUrl} alt={item.title} />
                                    </div>

                                    <div className="p-5 border-t-2">
                                        <h2 className="text-xs tracking-widest font-medium text-gray-400">
                                            E-Bharat
                                        </h2>

                                        <h1 className="text-lg font-medium mb-3"
                                            style={{ color: mode === 'dark' ? 'white' : '' }}>
                                            {item.title}
                                        </h1>

                                        <p>₹ {item.price}</p>

                                        {/* Quantity */}
                                        <div className="flex items-center justify-center gap-3 my-3"
                                            onClick={(e) => e.stopPropagation()}>
                                            <button onClick={(e) => { e.stopPropagation(); changeQty(item.id, -1); }}
                                                className="w-8 h-8 rounded bg-gray-200">-</button>

                                            <span className="w-10 text-center font-semibold">{qty}</span>

                                            <button onClick={(e) => { e.stopPropagation(); changeQty(item.id, 1); }}
                                                className="w-8 h-8 rounded bg-gray-200">+</button>
                                        </div>

                                        <button onClick={(e) => addCart(item, e)}
                                            className="w-full bg-pink-600 text-white py-2 rounded-lg">
                                            Add To Cart
                                        </button>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

export default ProductCard;