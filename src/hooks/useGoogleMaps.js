import { useLoadScript } from '@react-google-maps/api';

const libraries = ['places', 'geometry'];

export const useGoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyADGL8tEI96IB385NTHiT21owhWLUbFBTI",
    libraries: libraries,
  });

  return { isLoaded, loadError };
};