import React, { useContext } from 'react'
import myContext from '../../context/data/myContext'

// React Icons
import { GiGymBag } from "react-icons/gi";
import { FaTruckFast } from "react-icons/fa6";
import { FaTags } from "react-icons/fa";

function Track() {
    const context = useContext(myContext);
    const { mode } = context;

    // Shared styling for cards
    const cardStyle = {
        backgroundColor: mode === 'dark' ? 'rgb(46,49,55)' : '#F3F4F6',
        color: mode === 'dark' ? 'white' : '',
        borderColor: mode === 'dark' ? '#4B5563' : '#E5E7EB'
    };

    return (
        <div>
            <section className="text-gray-600 body-font">
                <div className="container px-5 md:py-10 mx-auto">

                    <div className="flex flex-wrap -m-4 text-center">

                        {/* -------------------- CARD 1 -------------------- */}
                        <div className="p-4 md:w-1/3 sm:w-1/2 w-full">
                            <div
                                className="border-2 px-6 py-8 rounded-2xl hover:shadow-2xl transition-shadow duration-300"
                                style={cardStyle}
                            >
                                <GiGymBag
                                    size={50}
                                    color="#6366F1"
                                    className="mb-4 inline-block"
                                />

                                <h2
                                    className="title-font font-semibold text-xl mb-2"
                                    style={{ color: mode === 'dark' ? 'white' : '#111827' }}
                                >
                                    Premium Sports Gear
                                </h2>

                                <p className="leading-relaxed text-sm">
                                    Top-quality equipment for every sport.
                                </p>
                            </div>
                        </div>


                        {/* -------------------- CARD 2 -------------------- */}
                        <div className="p-4 md:w-1/3 sm:w-1/2 w-full">
                            <div
                                className="border-2 px-6 py-8 rounded-2xl hover:shadow-2xl transition-shadow duration-300"
                                style={cardStyle}
                            >
                                <FaTruckFast
                                    size={50}
                                    color="#6366F1"
                                    className="mb-4 inline-block"
                                />

                                <h2
                                    className="title-font font-semibold text-xl mb-2"
                                    style={{ color: mode === 'dark' ? 'white' : '#111827' }}
                                >
                                    Fast Pan-India Delivery
                                </h2>

                                <p className="leading-relaxed text-sm">
                                    Fast & reliable delivery to your doorstep.
                                </p>
                            </div>
                        </div>


                        {/* -------------------- CARD 3 -------------------- */}
                        <div className="p-4 md:w-1/3 sm:w-1/2 w-full">
                            <div
                                className="border-2 px-6 py-8 rounded-2xl hover:shadow-2xl transition-shadow duration-300"
                                style={cardStyle}
                            >
                                <FaTags
                                    size={50}
                                    color="#6366F1"
                                    className="mb-4 inline-block"
                                />

                                <h2
                                    className="title-font font-semibold text-xl mb-2"
                                    style={{ color: mode === 'dark' ? 'white' : '#111827' }}
                                >
                                    Exclusive Deals & Offers
                                </h2>

                                <p className="leading-relaxed text-sm">
                                    Special discounts on all your favorite products.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}

export default Track;