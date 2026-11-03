export interface LngLat {
  lng: number;
  lat: number;
}

function outOfChina(lng: number, lat: number) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(lng: number, lat: number) {
  let value = -100 + 2 * lng + 3 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  value += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  value += ((20 * Math.sin(lat * Math.PI) + 40 * Math.sin((lat / 3) * Math.PI)) * 2) / 3;
  value += ((160 * Math.sin((lat / 12) * Math.PI) + 320 * Math.sin((lat * Math.PI) / 30)) * 2) / 3;
  return value;
}

function transformLng(lng: number, lat: number) {
  let value = 300 + lng + 2 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  value += ((20 * Math.sin(6 * lng * Math.PI) + 20 * Math.sin(2 * lng * Math.PI)) * 2) / 3;
  value += ((20 * Math.sin(lng * Math.PI) + 40 * Math.sin((lng / 3) * Math.PI)) * 2) / 3;
  value += ((150 * Math.sin((lng / 12) * Math.PI) + 300 * Math.sin((lng / 30) * Math.PI)) * 2) / 3;
  return value;
}

/** GCJ-02 转回 WGS84。地图点击得到的是高德坐标 */
export function gcj02ToWgs84(lng: number, lat: number): LngLat {
  if (outOfChina(lng, lat)) return { lng, lat };
  let wgsLng = lng;
  let wgsLat = lat;
  for (let i = 0; i < 8; i += 1) {
    const converted = wgs84ToGcj02(wgsLng, wgsLat);
    wgsLng += lng - converted.lng;
    wgsLat += lat - converted.lat;
  }
  return { lng: wgsLng, lat: wgsLat };
}

/** WGS84 转 GCJ-02，供高德底图对齐 */
export function wgs84ToGcj02(lng: number, lat: number): LngLat {
  if (outOfChina(lng, lat)) return { lng, lat };
  const a = 6378245;
  const ee = 0.006693421622965943;
  let dLat = transformLat(lng - 105, lat - 35);
  let dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  dLng = (dLng * 180) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return { lng: lng + dLng, lat: lat + dLat };
}

function perpendicularDistance(point: LngLat, start: LngLat, end: LngLat): number {
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  if (dx === 0 && dy === 0) return Math.hypot(point.lng - start.lng, point.lat - start.lat);
  const t = ((point.lng - start.lng) * dx + (point.lat - start.lat) * dy) / (dx * dx + dy * dy);
  return Math.hypot(point.lng - (start.lng + t * dx), point.lat - (start.lat + t * dy));
}

/** Douglas-Peucker，用栈避免深递归 */
export function simplifyPath<T extends LngLat>(points: T[], epsilon: number): T[] {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: Array<[number, number]> = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop()!;
    let max = 0;
    let index = -1;
    for (let i = start + 1; i < end; i++) {
      const distance = perpendicularDistance(points[i], points[start], points[end]);
      if (distance > max) {
        max = distance;
        index = i;
      }
    }
    if (index !== -1 && max > epsilon) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

/** 先等距预抽稀，再压到上限以内 */
export function simplifyToMax<T extends LngLat>(points: T[], maxCount: number): T[] {
  let current = points;
  if (current.length > 1500) {
    const step = Math.ceil(current.length / 1500);
    current = current.filter((point, index) => {
      if (index === 0 || index === current.length - 1 || index % step === 0) return true;
      const prev = points[index - 1] as T & { state?: string };
      const self = point as T & { state?: string };
      return Boolean(self.state && prev.state && self.state !== prev.state);
    });
  }
  if (current.length <= maxCount) return current.slice();
  let low = 0;
  let high = 0.02;
  let best = simplifyPath(current, high);
  for (let i = 0; i < 12; i++) {
    const mid = (low + high) / 2;
    const next = simplifyPath(current, mid);
    if (next.length > maxCount) low = mid;
    else {
      best = next;
      high = mid;
    }
  }
  return best;
}

export function haversineKm(start: LngLat, end: LngLat): number {
  const earthRadius = 6371;
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.min(1, Math.sqrt(h)));
}
