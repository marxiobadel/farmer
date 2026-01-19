import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";
import { GoogleMap as GoogleMapAPI, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
    width: "100%",
    height: "400px"
};

const center = {
    lat: 5.161007,
    lng: 10.496287
};

export default function GoogleMap() {
    const { name }  = usePage<SharedData>().props;

    const [showInfo, setShowInfo] = useState(true);

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMapAPI
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
            >
                <Marker
                    position={center} onClick={() => setShowInfo(true)}
                />
                {showInfo && (
                <InfoWindow
                    position={center}
                    onCloseClick={() => setShowInfo(false)}
                >
                    <div style={{
                        padding: '12px',
                        minWidth: '200px',
                        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                    }}>
                        <h3 style={{
                            margin: '0 0 6px 0',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#2c3e50'
                        }}>
                            {name}
                        </h3>

                        <div style={{
                            height: '1px',
                            backgroundColor: '#eee',
                            margin: '8px 0'
                        }} />

                        <p style={{
                            margin: '0 0 12px 0',
                            fontSize: '13px',
                            color: '#7f8c8d',
                            lineHeight: '1.4'
                        }}>
                            <strong>Location:</strong> {center.lat.toFixed(4)}°N, {center.lng.toFixed(4)}°E
                        </p>

                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                backgroundColor: 'rgb(234, 139, 0)',
                                color: '#ffffff',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: 600,
                                transition: 'background 0.3s'
                            }}
                        >
                            Itinéraire
                        </a>
                    </div>
                </InfoWindow>
            )}
            </GoogleMapAPI>
        </LoadScript>
    );
}
