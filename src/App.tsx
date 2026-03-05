import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  AppSettings,
  CenterlineCollection,
  CurbEdit,
  CurbSideCollection,
  CurbSideFeatureProps,
  JoinResult,
  LayerVisibility,
  ParkedHere,
  PermitZoneRecord,
  SnowRouteSegment,
  SweepingWardSection,
} from './types';
import { DEFAULT_LAYERS, DEFAULT_SETTINGS } from './config';
import {
  getAllEdits,
  saveEdit,
  deleteEdit,
  getParkedHere,
  setParkedHere,
  clearParkedHere,
  getSettings,
  saveSettings,
} from './store';
import { fetchCenterlines, fetchPermitZones, fetchSweepingData, fetchSnowRoutes } from './data/fetcher';
import { joinPermitZones } from './engine/join';
import { generateCurbSides } from './engine/curb-sides';
import { computeAvailability } from './engine/availability';
import { MapView } from './components/MapView';
import { Disclaimer } from './components/Disclaimer';
import { LayerToggles } from './components/LayerToggles';
import { Legend } from './components/Legend';
import { SegmentDetails } from './components/SegmentDetails';
import { EditSheet } from './components/EditSheet';
import { ParkedHereButton } from './components/ParkedHereButton';
import { BackupParking } from './components/BackupParking';
import { Settings } from './components/Settings';
import type { FeatureCollection, LineString } from 'geojson';

export default function App() {
  // Layer & settings state
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  // Data state
  const [centerlines, setCenterlines] = useState<CenterlineCollection | null>(null);
  const [permitZones, setPermitZones] = useState<PermitZoneRecord[]>([]);
  const [sweepingData, setSweepingData] = useState<SweepingWardSection[]>([]);
  const [snowRoutes, setSnowRoutes] = useState<SnowRouteSegment[]>([]);

  // Computed state
  const [joinResults, setJoinResults] = useState<JoinResult[]>([]);
  const [curbSides, setCurbSides] = useState<CurbSideCollection | null>(null);

  // User state
  const [edits, setEdits] = useState<CurbEdit[]>([]);
  const [parkedHere, setParkedHereState] = useState<ParkedHere | null>(getParkedHere);

  // UI state
  const [selectedSegment, setSelectedSegment] = useState<CurbSideFeatureProps | null>(null);
  const [editingSegment, setEditingSegment] = useState<CurbSideFeatureProps | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  // Load data on mount
  const loadData = useCallback(async () => {
    const [cl, pz, sw, sn] = await Promise.all([
      fetchCenterlines(),
      fetchPermitZones(),
      fetchSweepingData(),
      fetchSnowRoutes(),
    ]);
    setCenterlines(cl);
    setPermitZones(pz);
    setSweepingData(sw);
    setSnowRoutes(sn);
  }, []);

  useEffect(() => {
    loadData();
    getAllEdits().then(setEdits);
  }, [loadData]);

  // Run join when centerlines or permit zones change
  useEffect(() => {
    if (!centerlines) return;
    const results = joinPermitZones(centerlines.features, permitZones);
    setJoinResults(results);
  }, [centerlines, permitZones]);

  // Compute availability when inputs change
  useEffect(() => {
    if (!centerlines || joinResults.length === 0) return;

    const curbGeometries = generateCurbSides(centerlines.features);
    const collection = computeAvailability(
      curbGeometries,
      joinResults,
      centerlines.features,
      sweepingData,
      snowRoutes,
      edits,
      settings,
    );
    setCurbSides(collection);
  }, [centerlines, joinResults, sweepingData, snowRoutes, edits, settings]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Snow route GeoJSON for map overlay
  const snowRouteGeoJSON = useMemo<FeatureCollection<LineString> | null>(() => {
    if (snowRoutes.length === 0) return null;
    return {
      type: 'FeatureCollection',
      features: snowRoutes.map((sr, i) => ({
        type: 'Feature' as const,
        properties: { id: i, name: `${sr.street_direction} ${sr.street_name} ${sr.street_type}` },
        geometry: sr.geometry,
      })),
    };
  }, [snowRoutes]);

  // Handlers
  const handleSegmentClick = useCallback((props: CurbSideFeatureProps) => {
    setSelectedSegment(props);
    setEditingSegment(null);
  }, []);

  const handleSegmentLongPress = useCallback((props: CurbSideFeatureProps) => {
    setEditingSegment(props);
    setSelectedSegment(null);
  }, []);

  const handleSaveEdit = useCallback(async (edit: CurbEdit) => {
    await saveEdit(edit);
    setEdits(await getAllEdits());
    setEditingSegment(null);
  }, []);

  const handleDeleteEdit = useCallback(async (id: string) => {
    await deleteEdit(id);
    setEdits(await getAllEdits());
    setEditingSegment(null);
  }, []);

  const handlePark = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ph = setParkedHere(pos.coords.latitude, pos.coords.longitude);
        setParkedHereState(ph);
      },
      (err) => {
        alert('Could not get your location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleClearParked = useCallback(() => {
    clearParkedHere();
    setParkedHereState(null);
  }, []);

  const handleEditsImported = useCallback(async (imported: CurbEdit[]) => {
    setEdits(await getAllEdits());
  }, []);

  const existingEditForSegment = editingSegment
    ? edits.find((e) => e.id === `${editingSegment.segmentId}-${editingSegment.side}`)
    : undefined;

  return (
    <div className="app">
      <Disclaimer />

      <MapView
        curbSides={curbSides}
        layers={layers}
        parkedHere={parkedHere}
        snowRouteGeoJSON={snowRouteGeoJSON}
        onSegmentClick={handleSegmentClick}
        onSegmentLongPress={handleSegmentLongPress}
      />

      <LayerToggles
        layers={layers}
        onChange={setLayers}
        onSettingsClick={() => setShowSettings(true)}
        onBackupClick={() => setShowBackup(true)}
      />

      <Legend />

      <div className="parked-here-wrapper">
        <ParkedHereButton
          parkedHere={parkedHere}
          onPark={handlePark}
          onClear={handleClearParked}
        />
      </div>

      {selectedSegment && (
        <SegmentDetails
          segment={selectedSegment}
          onClose={() => setSelectedSegment(null)}
          onEdit={() => {
            setEditingSegment(selectedSegment);
            setSelectedSegment(null);
          }}
        />
      )}

      {editingSegment && (
        <EditSheet
          segment={editingSegment}
          existingEdit={existingEditForSegment}
          onSave={handleSaveEdit}
          onDelete={handleDeleteEdit}
          onClose={() => setEditingSegment(null)}
        />
      )}

      {showSettings && (
        <Settings
          settings={settings}
          onChange={setSettings}
          onEditsImported={handleEditsImported}
          onRefreshData={loadData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showBackup && <BackupParking onClose={() => setShowBackup(false)} />}
    </div>
  );
}
