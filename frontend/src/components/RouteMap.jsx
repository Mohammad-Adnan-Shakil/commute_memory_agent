import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Circle, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";

const CORRIDOR_ROUTES = {
  silk_board_orr: {
    name: "Silk Board → Outer Ring Road",
    coords: [
      [12.9172, 77.6229],
      [12.9215, 77.6332],
      [12.9245, 77.6412],
      [12.9278, 77.6558],
      [12.9310, 77.6701],
      [12.9335, 77.6835],
      [12.9350, 77.6963],
    ],
    origin: [12.9172, 77.6229],
    dest: [12.9350, 77.6963],
  },
  whitefield_stretch: {
    name: "Whitefield → Marathahalli",
    coords: [
      [12.9698, 77.7500],
      [12.9648, 77.7400],
      [12.9598, 77.7300],
      [12.9548, 77.7200],
      [12.9498, 77.7100],
    ],
    origin: [12.9698, 77.7500],
    dest: [12.9498, 77.7100],
  },
  hebbal: {
    name: "Hebbal",
    coords: [
      [13.0358, 77.5970],
      [13.0308, 77.5920],
      [13.0258, 77.5870],
      [13.0208, 77.5820],
    ],
    origin: [13.0358, 77.5970],
    dest: [13.0208, 77.5820],
  },
  electronic_city: {
    name: "Electronic City → Hosur Road",
    coords: [
      [12.8456, 77.6603],
      [12.8506, 77.6653],
      [12.8556, 77.6703],
      [12.8606, 77.6753],
      [12.8656, 77.6803],
    ],
    origin: [12.8456, 77.6603],
    dest: [12.8656, 77.6803],
  },
};

function getSegmentColor(segmentIndex, congestionLevel, bottleneckIndices) {
  if (bottleneckIndices && bottleneckIndices.includes(segmentIndex)) {
    if (congestionLevel === "HIGH") return "#ef4444";
    if (congestionLevel === "MEDIUM") return "#f59e0b";
    return "#f59e0b";
  }
  return "#22c55e";
}

function FitBoundsToRoute({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!coordinates || coordinates.length === 0) return;

    requestAnimationFrame(() => {
      map.invalidateSize();
      map.fitBounds(coordinates, { padding: [40, 40] });
    });
  }, [coordinates, map]);

  return null;
}

function ScrollActivator() {
  const map = useMap();
  const activated = useRef(false);

  useEffect(() => {
    map.scrollWheelZoom.disable();

    const enable = () => {
      if (!activated.current) {
        activated.current = true;
        map.scrollWheelZoom.enable();
      }
    };

    map.on("click", enable);
    map.on("focus", enable);

    return () => {
      map.off("click", enable);
      map.off("focus", enable);
    };
  }, [map]);

  return null;
}

function makeIcon(color, glowColor) {
  return L.divIcon({
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div style="width:18px;height:18px;position:relative;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${glowColor};filter:blur(6px);opacity:0.7;"></div>
      <div style="position:absolute;inset:3px;border-radius:50%;background:${color};border:2px solid ${color};box-shadow:0 0 8px ${glowColor};"></div>
    </div>`,
  });
}

const ORIGIN_ICON = makeIcon("#f59e0b", "rgba(245,158,11,0.5)");
const DEST_ICON = makeIcon("#06b6d4", "rgba(6,182,212,0.5)");

export default function RouteMap({ corridor, congestion, routeCoordinates, bottleneckIndices, originName, destName }) {
  const mapRef = useRef(null);
  const congestionLevel = congestion?.toUpperCase();
  const indices = bottleneckIndices || [];

  const hasRealCoords = routeCoordinates?.length > 1;
  const route = hasRealCoords
    ? {
        name: corridor ? CORRIDOR_ROUTES[corridor]?.name || "Route" : "Route",
        coords: routeCoordinates,
        origin: routeCoordinates[0],
        dest: routeCoordinates[routeCoordinates.length - 1],
      }
    : CORRIDOR_ROUTES[corridor];

  if (!route) return null;

  const segments = [];
  for (let i = 0; i < route.coords.length - 1; i++) {
    segments.push({
      from: route.coords[i],
      to: route.coords[i + 1],
      color: getSegmentColor(i, congestionLevel, indices),
    });
  }

  const midIdx = Math.floor(route.coords.length / 2);

  return (
    <div className="relative rounded-xl overflow-hidden border border-neutral-800/40">
      <div className="absolute top-2 left-2 z-[1000] flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-[10px] text-amber-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Origin
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-[10px] text-cyan-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Destination
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 text-[10px] text-green-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Clear
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-[10px] text-red-300 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Bottleneck
        </span>
      </div>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={11}
        zoomSnap={0.5}
        zoomDelta={0.5}
        scrollWheelZoom={true}
        dragging={true}
        zoomControl={false}
        className="w-full h-64 sm:h-80 z-0"
        ref={mapRef}
        role="application"
        aria-label="Interactive route map"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <FitBoundsToRoute coordinates={route.coords} />
        <ScrollActivator />

        {segments.map((seg, i) => (
          <Polyline
            key={i}
            positions={[seg.from, seg.to]}
            pathOptions={{
              color: seg.color,
              weight: 5,
              opacity: 0.9,
            }}
          />
        ))}

        <Circle
          center={route.origin}
          pathOptions={{
            color: "#f59e0b",
            fillColor: "#f59e0b",
            fillOpacity: 1,
            weight: 2,
            radius: 80,
          }}
        />

        <Circle
          center={route.dest}
          pathOptions={{
            color: "#06b6d4",
            fillColor: "#06b6d4",
            fillOpacity: 0.2,
            weight: 2,
            radius: 100,
          }}
        />

        {indices.length > 0 && (
          <Circle
            center={route.coords[midIdx]}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.08,
              weight: 1,
              className: "animate-glow-pulse",
              radius: 250,
            }}
          />
        )}

        <Marker position={route.origin} icon={ORIGIN_ICON}>
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
            {originName || "Origin"}
          </Tooltip>
        </Marker>
        <Marker position={route.dest} icon={DEST_ICON}>
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
            {destName || "Destination"}
          </Tooltip>
        </Marker>
      </MapContainer>

      <div className="px-3 py-1.5 bg-neutral-900/80 border-t border-neutral-800/30 flex items-center justify-between text-[10px]">
        <span className="text-neutral-500 font-medium">{route.name}</span>
      </div>
    </div>
  );
}
