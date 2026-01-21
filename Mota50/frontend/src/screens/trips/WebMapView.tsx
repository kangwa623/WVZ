import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type * as Leaflet from 'leaflet';

interface WebMapViewProps {
  style?: any;
  initialLocation?: { latitude: number; longitude: number };
  currentLocation?: { latitude: number; longitude: number };
  routeCoordinates?: Array<{ latitude: number; longitude: number }>;
  startLocation?: { latitude: number; longitude: number };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    L: typeof Leaflet;
  }
}

export default function WebMapView({
  style,
  initialLocation,
  currentLocation,
  routeCoordinates = [],
  startLocation,
}: WebMapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Leaflet.Map | null>(null);
  const markersRef = useRef<Leaflet.Marker[]>([]);
  const polylineRef = useRef<Leaflet.Polyline | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !mapRef.current) return;

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      document.head.appendChild(script);

      script.onload = () => {
        initializeMap();
      };
    } else {
      initializeMap();
    }

    function initializeMap() {
      if (!mapRef.current || !window.L) return;

      const center = initialLocation
        ? [initialLocation.latitude, initialLocation.longitude] as [number, number]
        : [-15.3875, 28.3228] as [number, number]; // Default to Lusaka, Zambia

      const map = window.L.map(mapRef.current, {
        center,
        zoom: 15,
        zoomControl: true,
      });

      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add start marker
      if (startLocation) {
        const startIcon = window.L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 20px;
            height: 20px;
            background-color: #4CAF50;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const startMarker = window.L.marker(
          [startLocation.latitude, startLocation.longitude],
          { icon: startIcon }
        ).addTo(map);
        startMarker.bindPopup('Trip Start');
        markersRef.current.push(startMarker);
      }

      // Add current location marker
      if (currentLocation) {
        const currentIcon = window.L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 20px;
            height: 20px;
            background-color: #FF6B35;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const currentMarker = window.L.marker(
          [currentLocation.latitude, currentLocation.longitude],
          { icon: currentIcon }
        ).addTo(map);
        currentMarker.bindPopup('Current Location');
        markersRef.current.push(currentMarker);
        map.setView([currentLocation.latitude, currentLocation.longitude], 15);
      }

      // Add route polyline
      if (routeCoordinates.length > 1) {
        const path = routeCoordinates.map((coord) => [coord.latitude, coord.longitude] as [number, number]);

        const polyline = window.L.polyline(path, {
          color: '#FF6B35',
          weight: 4,
          opacity: 1,
        }).addTo(map);

        polylineRef.current = polyline;

        // Fit bounds to show entire route
        if (path.length > 0) {
          const bounds = window.L.latLngBounds(path);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      polylineRef.current = null;
    };
  }, []); // Only run once on mount

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add start marker
    if (startLocation && mapInstanceRef.current) {
      const startIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 20px;
          height: 20px;
          background-color: #4CAF50;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const startMarker = window.L.marker(
        [startLocation.latitude, startLocation.longitude],
        { icon: startIcon }
      ).addTo(mapInstanceRef.current);
      startMarker.bindPopup('Trip Start');
      markersRef.current.push(startMarker);
    }

    // Add current location marker
    if (currentLocation && mapInstanceRef.current) {
      const currentIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 20px;
          height: 20px;
          background-color: #FF6B35;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const currentMarker = window.L.marker(
        [currentLocation.latitude, currentLocation.longitude],
        { icon: currentIcon }
      ).addTo(mapInstanceRef.current);
      currentMarker.bindPopup('Current Location');
      markersRef.current.push(currentMarker);
      mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 15);
    }
  }, [currentLocation, startLocation]);

  // Update polyline when route changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L || routeCoordinates.length < 2) {
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      return;
    }

    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    const path = routeCoordinates.map((coord) => [coord.latitude, coord.longitude] as [number, number]);

    const polyline = window.L.polyline(path, {
      color: '#FF6B35',
      weight: 4,
      opacity: 1,
    }).addTo(mapInstanceRef.current);

    polylineRef.current = polyline;

    // Fit bounds to show entire route
    if (path.length > 0) {
      const bounds = window.L.latLngBounds(path);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeCoordinates]);

  // Generate HTML for WebView (mobile platforms) - memoize to update when props change
  const mapHTML = React.useMemo(() => {
    const center = initialLocation || startLocation || { latitude: -15.3875, longitude: 28.3228 };
    const currentLoc = currentLocation || undefined;
    const routePath = routeCoordinates.length > 1 
      ? routeCoordinates.map(c => `[${c.latitude}, ${c.longitude}]`).join(', ')
      : '[]';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    #map { 
      width: 100%; 
      height: 100vh; 
      min-height: 100%;
    }
    .leaflet-container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // Wait for Leaflet to load
    if (typeof L === 'undefined') {
      console.error('Leaflet failed to load');
    } else {
      const map = L.map('map').setView([${center.latitude}, ${center.longitude}], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      ${startLocation ? `
      const startIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="width: 20px; height: 20px; background-color: #4CAF50; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([${startLocation.latitude}, ${startLocation.longitude}], { icon: startIcon })
        .addTo(map)
        .bindPopup('Trip Start');
      ` : ''}

      ${currentLoc ? `
      const currentIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="width: 20px; height: 20px; background-color: #FF6B35; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([${currentLoc.latitude}, ${currentLoc.longitude}], { icon: currentIcon })
        .addTo(map)
        .bindPopup('Current Location');
      map.setView([${currentLoc.latitude}, ${currentLoc.longitude}], 15);
      ` : ''}

      ${routeCoordinates.length > 1 ? `
      const routePath = [${routePath}];
      L.polyline(routePath, { color: '#FF6B35', weight: 4, opacity: 1 }).addTo(map);
      if (routePath.length > 0) {
        const bounds = L.latLngBounds(routePath);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
      ` : ''}
    }
  </script>
</body>
</html>
    `;
  }, [initialLocation, currentLocation, routeCoordinates, startLocation]);

  // Use WebView for mobile platforms
  if (Platform.OS !== 'web') {
    return (
      <View style={[{ flex: 1 }, style]}>
        <WebView
          key={`map-${currentLocation?.latitude}-${currentLocation?.longitude}-${routeCoordinates.length}`}
          source={{ html: mapHTML }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowFileAccess={true}
          mixedContentMode="always"
          originWhitelist={['*']}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
          }}
        />
      </View>
    );
  }

  // Use native div for web
  return (
    <View style={style}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 400,
        }}
      />
    </View>
  );
}

