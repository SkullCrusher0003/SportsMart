import React, { useContext, useState } from 'react'
import myContext from '../../../context/data/myContext'
import LocationPicker from '../../../components/location/LocationPicker'
import { toast } from 'react-toastify'

function AddProduct() {
    const context = useContext(myContext);
    const {products, setProducts, addProduct} = context
    
    const [location, setLocation] = useState(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    const handleLocationSelect = (selectedLocation) => {
        setLocation(selectedLocation);
        setProducts({ 
            ...products, 
            location: {
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                address: selectedLocation.address
            }
        });
        setShowLocationPicker(false);
        toast.success('Location selected successfully');
    };

    const handleAddProduct = () => {
        if (!location) {
            return toast.error("Please select product location");
        }
        addProduct();
    };
    
    return (
        <div>
            <div className='flex justify-center items-center min-h-screen py-8'>
                <div className='bg-gray-800 px-10 py-10 rounded-xl w-full max-w-2xl'>
                    <div className="">
                        <h1 className='text-center text-white text-xl mb-4 font-bold'>Add Product</h1>
                    </div>
                    
                    {/* Product Title */}
                    <div>
                        <input 
                            type="text"
                            onChange={(e) => setProducts({ ...products, title: e.target.value })} 
                            value={products.title}
                            name='title'
                            className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                            placeholder='Product title'
                        />
                    </div>
                    
                    {/* Product Price */}
                    <div>
                        <input 
                            type="text"
                            name='price'
                            onChange={(e) => setProducts({ ...products, price: e.target.value })} 
                            value={products.price}
                            className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                            placeholder='Product price'
                        />
                    </div>
                    
                    {/* Product Quantity */}
                    <div>
                        <input 
                            type="number"
                            name='quantity'
                            onChange={(e) => setProducts({ ...products, quantity: e.target.value })} 
                            value={products.quantity}
                            className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                            placeholder='Available stock quantity'
                            min="0"
                        />
                    </div>
                    
                    {/* Minimum Order Quantity (MOQ) */}
                    <div>
                        <input 
                            type="number"
                            name='moq'
                            onChange={(e) => setProducts({ ...products, moq: e.target.value })} 
                            value={products.moq}
                            className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                            placeholder='Minimum order quantity (optional)'
                            min="1"
                        />
                    </div>
                    
                    {/* Product Image URL */}
                    <div>
                        <input 
                            type="text"
                            name='imageurl'
                            onChange={(e) => setProducts({ ...products, imageUrl: e.target.value })} 
                            value={products.imageUrl}
                            className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                            placeholder='Product imageUrl'
                        />
                    </div>
                    
                    {/* Product Category */}
                    <div>
                        <input 
                            type="text"
                            name='category'
                            onChange={(e) => setProducts({ ...products, category: e.target.value })} 
                            value={products.category}
                            className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                            placeholder='Product category'
                        />
                    </div>
                    
                    {/* Product Description */}
                    <div>
                       <textarea 
                           cols="30" 
                           rows="10" 
                           name='description' 
                           onChange={(e) => setProducts({ ...products, description: e.target.value })}
                           value={products.description}
                           className='bg-gray-600 mb-4 px-2 py-2 w-full rounded-lg text-white placeholder:text-gray-200 outline-none'
                           placeholder='Product Description'
                       />
                    </div>

                    {/* Location Selection */}
                    <div className="mb-4">
                        <button
                            type="button"
                            onClick={() => setShowLocationPicker(!showLocationPicker)}
                            className='bg-gray-600 w-full px-2 py-2 rounded-lg text-white hover:bg-gray-700 transition-colors'
                        >
                            {location ? '📍 Location Selected' : '📍 Select Product Location'}
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
                    
                    {/* Add Product Button */}
                    <div className='flex justify-center mb-3'>
                        <button
                            onClick={handleAddProduct}
                            className='bg-yellow-500 w-full text-black font-bold px-2 py-2 rounded-lg hover:bg-yellow-600 transition-colors'
                        >
                            Add Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddProduct
