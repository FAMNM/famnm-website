

import { useEffect, useRef, type MutableRefObject } from "react";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = 'pk.eyJ1IjoiZmFtbm0iLCJhIjoiY2xxeWlsMzB1MHJhdjJpcG81eWxvNm1qMyJ9.2lpKHbsw8I8IfwwGbNtPNA';

export interface MapProps {
    markers: {
        lat: number;
        long: number;
        title: string;
        icon: string;
    }[];
    mapRef: MutableRefObject<mapboxgl.Map|null>
}

export default function EventMap({ markers, mapRef: map }: MapProps) {
    const mapContainer = useRef<HTMLDivElement|null>(null);

    useEffect(() => {
        (async () => {
            const bootstrap = await import("bootstrap");
            if (map.current) return;
            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/standard',
                center: [-83.71586879253918, 42.29229839945093],
                zoom: 16,
                pitch: 30,
                minZoom: 14,
            });
            map.current.addControl(
                new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                    showUserHeading: true
                })
            );
            for (const marker of markers) {
                const markerElement = document.createElement('i');
                markerElement.classList.add('fa-solid', marker.icon, 'event-map-marker');
                markerElement.setAttribute('title', marker.title);
                new bootstrap.Tooltip(markerElement);
                new mapboxgl.Marker({ element: markerElement })
                    .setLngLat([marker.long, marker.lat])
                    .addTo(map.current);
            }
        })();
    }, [markers]);

    return <div className="event-map-container">
        <div ref={mapContainer} style={{width: '100%', height: '100%', border: '1px solid gray', borderRadius: '4px', overflow: 'hidden'}}></div>
    </div>;
}