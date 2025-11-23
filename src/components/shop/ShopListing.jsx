import React, { useState, useEffect, useContext } from 'react';
import { LocationContext } from '../../context/location/LocationContext';
import { collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px'
};

function ShopListing() {
  const { userLocation, calculateDistance, getCurrentLocation } = useContext(LocationContext);
  const { isLoaded } = useGoogleMaps();
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [distanceFilter, setDistanceFilter] = useState(10); // km
  const [selectedShop, setSelectedShop] = useState(null);
  const [sortBy, setSortBy] = useState('distance'); // distance or rating

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    if (userLocation && shops.length > 0) {
      filterAndSortShops();
    }
  }, [userLocation, shops, distanceFilter, sortBy]);

  const fetchShops = async () => {
    try {
      const shopsCollection = collection(fireDB, 'shops');
      const shopsSnapshot = await getDocs(shopsCollection);
      const shopsList = shopsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShops(shopsList);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const filterAndSortShops = () => {
    let filtered = shops.map(shop => {
      if (shop.location && shop.location.lat && shop.location.lng) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          shop.location.lat,
          shop.location.lng
        );
        return { ...shop, distance };
      }
      return { ...shop, distance: null };
    });

    // Filter by distance
    filtered = filtered.filter(shop => 
      shop.distance !== null && shop.distance <= distanceFilter
    );

    // Sort
    if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredShops(filtered);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Nearby Shops</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
        <button
          onClick={getCurrentLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Get My Location
        </button>

        <div className="flex items-center gap-2">
          <label className="font-medium">Distance:</label>
          <select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div className="ml-auto text-gray-600">
          Found {filteredShops.length} shops
        </div>
      </div>

      {/* Map View */}
      {userLocation && (
        <div className="mb-6">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={userLocation}
          >
            {/* User location marker */}
            <Marker
              position={userLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />

            {/* Shop markers */}
            {filteredShops.map(shop => (
              <Marker
                key={shop.id}
                position={shop.location}
                onClick={() => setSelectedShop(shop)}
              />
            ))}

            {/* Info Window */}
            {selectedShop && (
              <InfoWindow
                position={selectedShop.location}
                onCloseClick={() => setSelectedShop(null)}
              >
                <div className="p-2">
                  <h3 className="font-bold text-lg">{selectedShop.name}</h3>
                  <p className="text-sm">{selectedShop.address}</p>
                  <p className="text-sm font-medium text-blue-600">
                    {selectedShop.distance?.toFixed(2)} km away
                  </p>
                  {selectedShop.rating && (
                    <p className="text-sm">Rating: {selectedShop.rating} ⭐</p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}

      {/* List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map(shop => (
          <div key={shop.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <h3 className="text-xl font-bold mb-2">{shop.name}</h3>
            <p className="text-gray-600 mb-2">{shop.address}</p>
            <div className="flex items-center justify-between">
              <span className="text-blue-600 font-medium">
                📍 {shop.distance?.toFixed(2)} km
              </span>
              {shop.rating && (
                <span className="text-yellow-500">
                  ⭐ {shop.rating}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedShop(shop)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {!userLocation && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            Please enable location services to see nearby shops
          </p>
          <button
            onClick={getCurrentLocation}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Enable Location
          </button>
        </div>
      )}
    </div>
  );
}

export default ShopListing;