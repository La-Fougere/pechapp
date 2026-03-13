import React, { useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
} from '@ionic/react';
import { Location } from '../models/Location';
import { connect } from '../data/connect';
import { loadLocations } from '../data/locations/locations.actions';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import './MapView.scss';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from '../i18n';

// Fix for marker icons in Vite
L.Icon.Default.prototype.options.iconUrl = markerIconUrl;
L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl;
L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl;
L.Icon.Default.imagePath = "";

interface StateProps {
  locations: Location[];
}

interface DispatchProps {
  loadLocations: typeof loadLocations;
}

const MapView: React.FC<StateProps & DispatchProps> = ({
  locations,
  loadLocations,
}) => {
  const mapCanvas = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();

  // Add useEffect to load locations when component mounts
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const initMap = () => {
    if (!isOnline || !locations?.length || !mapCanvas.current || map.current) {
      return;
    }

    map.current = L.map(mapCanvas.current, {
      zoomControl: true,
      attributionControl: true,
    });

    // Get the center location (first item marked as center, or first item if none marked)
    const centerLocation = locations.find((loc) => loc.center) || locations[0];
    map.current.setView([centerLocation.lat, centerLocation.lng], 16);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map.current);

    // Add markers for all locations
    locations.forEach((location: Location) => {
      const marker = L.marker([location.lat, location.lng])
        .addTo(map.current!)
        .bindPopup(`${location.name}`);
      markers.current.push(marker);
    });

    // Show map
    mapCanvas.current.classList.add('show-map');
  };

  const resizeMap = () => {
    if (map.current) {
      map.current.invalidateSize();
    }
  };

  // Initialize map
  useEffect(() => {
    initMap();
    return () => {
      if (map.current) {
        markers.current.forEach((marker) => marker.remove());
        map.current.remove();
        map.current = null;
      }
    };
  }, [locations, isOnline]);

  // Handle resize after content is visible
  useEffect(() => {
    const timer = setTimeout(() => {
      resizeMap();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useIonViewDidEnter(() => {
    resizeMap();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('navMap')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          className={`map-wrapper offline-resource ${isOnline ? '' : 'offline-resource--offline'}`}
        >
          <div ref={mapCanvas} className="map-canvas offline-resource__content"></div>
          {!isOnline && (
            <div
              className="offline-resource__overlay"
              role="status"
              aria-live="polite"
            >
              {t('offlineMessage')}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    locations: state.locations.locations,
  }),
  mapDispatchToProps: {
    loadLocations,
  },
  component: MapView,
});
