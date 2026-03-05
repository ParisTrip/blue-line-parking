import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { CurbSideCollection, CurbSideFeatureProps, LayerVisibility, ParkedHere } from '../types';
import { JEFFERSON_PARK_STATION, BOUNDS, BOUNDS_POLYGON, DEFAULT_ZOOM, LONG_PRESS_MS } from '../config';
import type { FeatureCollection, LineString } from 'geojson';

interface Props {
  curbSides: CurbSideCollection | null;
  layers: LayerVisibility;
  parkedHere: ParkedHere | null;
  snowRouteGeoJSON: FeatureCollection<LineString> | null;
  onSegmentClick: (props: CurbSideFeatureProps) => void;
  onSegmentLongPress: (props: CurbSideFeatureProps) => void;
}

const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};

const COLOR_MAP: Record<string, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

export function MapView({
  curbSides,
  layers,
  parkedHere,
  snowRouteGeoJSON,
  onSegmentClick,
  onSegmentLongPress,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const parkedMarkerRef = useRef<maplibregl.Marker | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const wasLongPress = useRef(false);
  const geolocateRef = useRef<maplibregl.GeolocateControl | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [JEFFERSON_PARK_STATION.lng, JEFFERSON_PARK_STATION.lat],
      zoom: DEFAULT_ZOOM,
      maxBounds: [
        [BOUNDS.west - 0.004, BOUNDS.south - 0.004],
        [BOUNDS.east + 0.004, BOUNDS.north + 0.004],
      ],
    });

    // Prevent context menu on long press
    map.getCanvas().addEventListener('contextmenu', (e) => e.preventDefault());

    // Navigation controls
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    // Geolocation
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    } as any);
    map.addControl(geolocate, 'top-right');
    geolocateRef.current = geolocate;

    map.on('load', () => {
      // Boundary rectangle
      map.addSource('boundary', {
        type: 'geojson',
        data: BOUNDS_POLYGON,
      });
      map.addLayer({
        id: 'boundary-fill',
        type: 'fill',
        source: 'boundary',
        paint: {
          'fill-color': '#ff6600',
          'fill-opacity': 0.03,
        },
      });
      map.addLayer({
        id: 'boundary-line',
        type: 'line',
        source: 'boundary',
        paint: {
          'line-color': '#ff6600',
          'line-width': 2,
          'line-dasharray': [4, 2],
        },
      });

      // Curb sides source (empty initially)
      map.addSource('curb-sides', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Main availability layer
      map.addLayer({
        id: 'curb-sides-line',
        type: 'line',
        source: 'curb-sides',
        paint: {
          'line-color': [
            'match',
            ['get', 'color'],
            'green', COLOR_MAP.green,
            'yellow', COLOR_MAP.yellow,
            'red', COLOR_MAP.red,
            '#888888',
          ],
          'line-width': 6,
          'line-opacity': 0.85,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Permit risk overlay (dashed)
      map.addLayer({
        id: 'curb-sides-permit',
        type: 'line',
        source: 'curb-sides',
        filter: ['==', ['get', 'hasPermitZone'], true],
        paint: {
          'line-color': '#a855f7',
          'line-width': 3,
          'line-dasharray': [2, 2],
          'line-opacity': 0.7,
        },
        layout: {
          visibility: 'none',
        },
      });

      // Sweeping risk overlay (dotted)
      map.addLayer({
        id: 'curb-sides-sweeping',
        type: 'line',
        source: 'curb-sides',
        filter: ['==', ['get', 'sweepingRisk'], true],
        paint: {
          'line-color': '#06b6d4',
          'line-width': 3,
          'line-dasharray': [1, 3],
          'line-opacity': 0.7,
        },
        layout: {
          visibility: 'none',
        },
      });

      // My edits overlay (thicker highlight)
      map.addLayer({
        id: 'curb-sides-edits',
        type: 'line',
        source: 'curb-sides',
        filter: ['==', ['get', 'hasUserEdit'], true],
        paint: {
          'line-color': '#f97316',
          'line-width': 8,
          'line-opacity': 0.3,
        },
      });

      // Snow routes source
      map.addSource('snow-routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'snow-routes-line',
        type: 'line',
        source: 'snow-routes',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 6,
          'line-opacity': 0.4,
        },
        layout: {
          visibility: 'none',
          'line-cap': 'round',
        },
      });

      // Click handler
      map.on('click', 'curb-sides-line', (e) => {
        if (wasLongPress.current) {
          wasLongPress.current = false;
          return;
        }
        if (e.features && e.features.length > 0) {
          const props = e.features[0].properties;
          onSegmentClick({
            ...props,
            reasons: JSON.parse(props.reasons as unknown as string),
          } as CurbSideFeatureProps);
        }
      });

      // Cursor change
      map.on('mouseenter', 'curb-sides-line', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'curb-sides-line', () => {
        map.getCanvas().style.cursor = '';
      });

      // Long press via touch events
      map.on('touchstart', 'curb-sides-line', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          longPressTimer.current = window.setTimeout(() => {
            wasLongPress.current = true;
            const props = feature.properties;
            onSegmentLongPress({
              ...props,
              reasons: JSON.parse(props!.reasons as unknown as string),
            } as CurbSideFeatureProps);
          }, LONG_PRESS_MS);
        }
      });

      const clearLongPress = () => {
        if (longPressTimer.current !== null) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      };
      map.on('touchend', clearLongPress);
      map.on('touchmove', clearLongPress);

      // Auto-trigger geolocation
      geolocate.trigger();

      setMapReady(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update curb sides data (must wait for map load to create the source)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !curbSides || !mapReady) return;

    const source = map.getSource('curb-sides') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      const data = {
        ...curbSides,
        features: curbSides.features.map((f) => ({
          ...f,
          properties: {
            ...f.properties,
            reasons: JSON.stringify(f.properties.reasons),
          },
        })),
      };
      console.log(`[MAP] Rendering ${data.features.length} curb side segments`);
      source.setData(data as any);
    }
  }, [curbSides, mapReady]);

  // Update snow route data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !snowRouteGeoJSON || !mapReady) return;

    const source = map.getSource('snow-routes') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(snowRouteGeoJSON);
    }
  }, [snowRouteGeoJSON, mapReady]);

  // Update layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const setVis = (id: string, visible: boolean) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
      }
    };

    setVis('curb-sides-line', layers.availability);
    setVis('curb-sides-permit', layers.permitRisk);
    setVis('curb-sides-sweeping', layers.sweeping);
    setVis('snow-routes-line', layers.snowRoutes);
    setVis('curb-sides-edits', layers.myEdits);
  }, [layers, mapReady]);

  // Parked here marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (parkedMarkerRef.current) {
      parkedMarkerRef.current.remove();
      parkedMarkerRef.current = null;
    }

    if (parkedHere) {
      const el = document.createElement('div');
      el.className = 'parked-marker';
      el.innerHTML = '<div class="parked-marker__icon">P</div>';

      parkedMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([parkedHere.lng, parkedHere.lat])
        .addTo(map);
    }
  }, [parkedHere]);

  return <div ref={containerRef} className="map-container" />;
}
