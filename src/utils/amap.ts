import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/utils/leaflet-global";
import "leaflet-rotate/dist/leaflet-rotate.js";
import { wgs84ToGcj02, type LngLat } from "@/utils/geo";

/** 首都机场三座航站楼（WGS84） */
export const TERMINALS: Array<LngLat & { name: string }> = [
  { name: "T1 航站楼", lng: 116.5846, lat: 40.0801 },
  { name: "T2 航站楼", lng: 116.5939, lat: 40.0799 },
  { name: "T3 航站楼", lng: 116.6158, lat: 40.0528 },
];

/** 首都机场飞行区（WGS84），地图圈定采集 */
export const AIRPORT_AREA: LngLat[] = [
  { lng: 116.56968550548693, lat: 40.106849967300874 },
  { lng: 116.57071552691518, lat: 40.103066146959236 },
  { lng: 116.57174863408879, lat: 40.10241378557289 },
  { lng: 116.57214823555, lat: 40.10203206802745 },
  { lng: 116.57817404284316, lat: 40.10245347499714 },
  { lng: 116.58016538432176, lat: 40.10236670754414 },
  { lng: 116.6092276810112, lat: 40.10510090658068 },
  { lng: 116.61581810404418, lat: 40.08727675951325 },
  { lng: 116.62115967852426, lat: 40.05305777371275 },
  { lng: 116.61965414760672, lat: 40.05285568219265 },
  { lng: 116.62027677680003, lat: 40.048575934225624 },
  { lng: 116.61815120259797, lat: 40.04836985410394 },
  { lng: 116.61779407449659, lat: 40.05014659495586 },
  { lng: 116.6172980770754, lat: 40.05027830555951 },
  { lng: 116.61478831569741, lat: 40.04994106738929 },
  { lng: 116.61507746727486, lat: 40.0462114469093 },
  { lng: 116.6063765268466, lat: 40.04555643788736 },
  { lng: 116.60552605126837, lat: 40.05127308068832 },
  { lng: 116.6044270605788, lat: 40.051997667377144 },
  { lng: 116.60304434417046, lat: 40.052604629535715 },
  { lng: 116.59320818804642, lat: 40.051673679973874 },
  { lng: 116.59301609716402, lat: 40.05295668791951 },
  { lng: 116.59492586983882, lat: 40.05321473629554 },
  { lng: 116.59364032812164, lat: 40.060140760786624 },
  { lng: 116.59288643878199, lat: 40.06003888657779 },
  { lng: 116.59082330023135, lat: 40.07011077838386 },
  { lng: 116.5890816546338, lat: 40.07047007716194 },
  { lng: 116.58845491846687, lat: 40.0736369217574 },
  { lng: 116.58739026587729, lat: 40.073532527142156 },
  { lng: 116.58705606367523, lat: 40.073407994616595 },
  { lng: 116.58417222694395, lat: 40.073096869922516 },
  { lng: 116.58385280047428, lat: 40.07380701455071 },
  { lng: 116.57364130798557, lat: 40.073096047996934 },
  { lng: 116.56747067694408, lat: 40.10385377596518 },
  { lng: 116.5685188324852, lat: 40.10403592156683 },
  { lng: 116.56817553573848, lat: 40.106644725094064 },
];

const ROAD_TILE = "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}";

export function toAmapLatLng(point: LngLat): L.LatLngExpression {
  const converted = wgs84ToGcj02(point.lng, point.lat);
  return [converted.lat, converted.lng];
}

export function airportBounds(extra: LngLat[] = [], area: LngLat[] = AIRPORT_AREA): L.LatLngBounds {
  return L.latLngBounds([...area, ...extra].map((point) => toAmapLatLng(point)));
}

const AIRPORT_AREA_STYLE: L.PathOptions = {
  color: "#2563EB",
  weight: 2,
  fillColor: "#2563EB",
  fillOpacity: 0.16,
  interactive: false,
  bubblingMouseEvents: false,
};

export function createAirportAreaLayer(points: LngLat[]): L.Polygon {
  return L.polygon(
    points.map((point) => toAmapLatLng(point)),
    AIRPORT_AREA_STYLE,
  );
}

export function areaCenter(points: LngLat[]): LngLat {
  if (!points.length) return { lng: 0, lat: 0 };
  let lng = 0;
  let lat = 0;
  points.forEach((point) => {
    lng += point.lng;
    lat += point.lat;
  });
  return { lng: lng / points.length, lat: lat / points.length };
}

type BearingMap = L.Map & {
  setBearing: (bearing: number) => void;
  getBearing: () => number;
};

export function setMapBearing(map: L.Map, bearing: number) {
  (map as BearingMap).setBearing(((bearing % 360) + 360) % 360);
}

export function getMapBearing(map: L.Map) {
  return Math.round((map as BearingMap).getBearing() || 0);
}

/** 地图监控默认旋转角（正北顺时针，与圈定飞行区时一致） */
export const MONITOR_DEFAULT_BEARING = 277;

/** 地图监控默认缩放级别 */
export const MONITOR_DEFAULT_ZOOM = 14.25;

/** 默认视野：区域面几何中心 + 固定缩放 + 默认旋转角 */
export function applyMonitorDefaultView(map: L.Map, _padding?: L.FitBoundsOptions, area: LngLat[] = AIRPORT_AREA) {
  if (!area.length) return;
  const center = areaCenter(area);
  setMapBearing(map, MONITOR_DEFAULT_BEARING);
  map.setView(toAmapLatLng(center), MONITOR_DEFAULT_ZOOM, { animate: false });
}

export function createAmap(
  container: HTMLElement,
  options?: { rotate?: boolean; showAirportArea?: boolean; fitOnCreate?: boolean },
): L.Map {
  const rotate = options?.rotate ?? false;
  const showAirportArea = options?.showAirportArea ?? true;
  const fitOnCreate = options?.fitOnCreate ?? true;
  container.classList.remove("map-theme-neon");
  const map = L.map(container, {
    zoomControl: true,
    attributionControl: true,
    zoomSnap: 0.25,
    zoomDelta: 0.25,
    rotate,
    bearing: 0,
    pitch: 0,
    rotateControl: false,
    pitchDrag: false,
    shiftKeyRotate: rotate,
    touchRotate: rotate,
  } as L.MapOptions);

  L.tileLayer(ROAD_TILE, {
    subdomains: ["1", "2", "3", "4"],
    maxZoom: 18,
    minZoom: 3,
    attribution: "© 高德地图",
  }).addTo(map);

  if (showAirportArea) {
    createAirportAreaLayer(AIRPORT_AREA).addTo(map);
  }

  TERMINALS.forEach((terminal) => {
    const icon = L.divIcon({
      className: "terminal-label",
      html: `<span>${terminal.name}</span>`,
      iconSize: [92, 28],
      iconAnchor: [46, 28],
    });
    L.marker(toAmapLatLng(terminal), { icon, interactive: false, zIndexOffset: 600 }).addTo(map);
  });

  if (fitOnCreate) {
    map.fitBounds(airportBounds(), { padding: [36, 36] });
  }
  return map;
}
