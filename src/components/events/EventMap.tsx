

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = 'pk.eyJ1IjoiLWJyb2Fkd2VsbCIsImEiOiJjbG1hNG00emswazB3M2RycXJ3NzNyZ2hzIn0.sFckVj-c_YZE9XJxd_KCKQ';

export interface MapProps {
    markers: {
        lat: number;
        long: number;
        title: string;
        icon: string;
    }[];
}

export default function EventMap({ markers }: MapProps) {
    const mapContainer = useRef<HTMLDivElement|null>(null);
    const map = useRef<mapboxgl.Map|null>(null);

    useEffect(() => {
        (async () => {
            const bootstrap = await import("bootstrap");
            if (map.current) return;
            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/outdoors-v12',
                center: [-83.71586879253918, 42.29229839945093],
                zoom: 15,
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
    });

    return <div className="event-map-container">
        <div ref={mapContainer} style={{width: '100%', height: '100%'}}></div>
    </div>;
}