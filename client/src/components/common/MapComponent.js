// client/src/components/common/MapComponent.js

import React, { useState, useEffect } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.375rem",
};

const defaultCenter = {
  lat: 40.12,
  lng: -100.45,
};

const MapComponent = ({
  isLoaded,
  parcel,
  containerStyle: customContainerStyle,
}) => {
  const [pickupCoord, setPickupCoord] = useState(null);
  const [deliveryCoord, setDeliveryCoord] = useState(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (isLoaded && parcel && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      setPickupCoord(null);
      setDeliveryCoord(null);

      geocoder.geocode({ address: parcel.pickupAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          setPickupCoord({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error(`Pickup geocode failed: ${status}`);
        }
      });

      geocoder.geocode(
        { address: parcel.deliveryAddress },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            setDeliveryCoord({ lat: location.lat(), lng: location.lng() });
          } else {
            console.error(`Delivery geocode failed: ${status}`);
          }
        }
      );
    }
  }, [isLoaded, parcel]);

  useEffect(() => {
    if (map && pickupCoord && deliveryCoord) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupCoord);
      bounds.extend(deliveryCoord);
      map.fitBounds(bounds);
    } else if (map && (pickupCoord || deliveryCoord)) {
      map.panTo(pickupCoord || deliveryCoord);
      map.setZoom(12);
    }
  }, [map, pickupCoord, deliveryCoord]);

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200">
        <p className="text-gray-500">Loading Map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={customContainerStyle || containerStyle}
      center={defaultCenter}
      zoom={3}
      onLoad={setMap}
      onUnmount={() => setMap(null)}
    >
      {pickupCoord && (
        <MarkerF position={pickupCoord} label="P" title="Pickup" />
      )}
      {deliveryCoord && (
        <MarkerF position={deliveryCoord} label="D" title="Delivery" />
      )}
    </GoogleMap>
  );
};

export default MapComponent;
