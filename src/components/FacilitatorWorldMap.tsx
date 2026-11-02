"use client";
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// TopoJSON world map
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

type Topology = {
  type: 'Topology';
  objects: Record<string, any>;
  arcs: any[];
  transform?: any;
};

// Country coordinates (capital/major cities)
const countryCoordinates: Record<string, [number, number]> = {
  'Afghanistan': [69.1723, 34.5281],
  'Albania': [19.8189, 41.3275],
  'Algeria': [3.0588, 36.7538],
  'Andorra': [1.5218, 42.5063],
  'Angola': [13.2343, -8.8368],
  'Antigua and Barbuda': [-61.7964, 17.0747],
  'Argentina': [-58.3816, -34.6037],
  'Armenia': [44.5152, 40.1792],
  'Australia': [151.2093, -33.8688],
  'Austria': [16.3738, 48.2082],
  'Azerbaijan': [49.8671, 40.4093],
  'Bahamas': [-77.3963, 25.0343],
  'Bahrain': [50.5577, 26.2285],
  'Bangladesh': [90.4125, 23.8103],
  'Barbados': [-59.5432, 13.1939],
  'Belarus': [27.5615, 53.9006],
  'Belgium': [4.3517, 50.8503],
  'Belize': [-88.7713, 17.2510],
  'Benin': [2.3158, 6.4969],
  'Bhutan': [89.6419, 27.4728],
  'Bolivia': [-68.1193, -16.4897],
  'Bosnia and Herzegovina': [18.4131, 43.8563],
  'Botswana': [25.9201, -24.6282],
  'Brazil': [-46.6333, -23.5505],
  'Brunei': [114.9398, 4.9031],
  'Bulgaria': [23.3219, 42.6977],
  'Burkina Faso': [-1.5197, 12.3714],
  'Burundi': [29.3599, -3.3731],
  'Cabo Verde': [-23.5087, 14.9330],
  'Cambodia': [104.9160, 11.5564],
  'Cameroon': [11.5021, 3.8480],
  'Canada': [-79.3832, 43.6532],
  'Central African Republic': [18.5582, 4.3947],
  'Chad': [15.0444, 12.1348],
  'Chile': [-70.6693, -33.4489],
  'China': [121.4737, 31.2304],
  'Colombia': [-74.0721, 4.7110],
  'Comoros': [43.2551, -11.7172],
  'Congo': [15.2663, -4.2634],
  'Congo (Democratic Republic)': [15.3070, -4.3276],
  'Costa Rica': [-84.0907, 9.9281],
  'Côte d\'Ivoire': [-4.0083, 5.3600],
  'Croatia': [15.9819, 45.8150],
  'Cuba': [-82.3666, 23.1136],
  'Cyprus': [33.3823, 35.1856],
  'Czech Republic': [14.4378, 50.0755],
  'Denmark': [12.5683, 55.6761],
  'Djibouti': [43.1456, 11.5721],
  'Dominica': [-61.3710, 15.3092],
  'Dominican Republic': [-69.9312, 18.4861],
  'Ecuador': [-78.4678, -0.1807],
  'Egypt': [31.2357, 30.0444],
  'El Salvador': [-89.1872, 13.6929],
  'Equatorial Guinea': [8.7832, 3.7504],
  'Eritrea': [38.9318, 15.3229],
  'Estonia': [24.7536, 59.4370],
  'Eswatini': [31.1367, -26.3054],
  'Ethiopia': [38.7578, 9.0320],
  'Fiji': [178.0650, -18.1416],
  'Finland': [24.9384, 60.1699],
  'France': [2.3522, 48.8566],
  'Gabon': [9.4673, 0.4162],
  'Gambia': [-16.5885, 13.4549],
  'Georgia': [44.7930, 41.7151],
  'Germany': [13.4050, 52.5200],
  'Ghana': [-0.1870, 5.6037],
  'Greece': [23.7275, 37.9838],
  'Grenada': [-61.7485, 12.0564],
  'Guatemala': [-90.5069, 14.6349],
  'Guinea': [-13.7164, 9.6412],
  'Guinea-Bissau': [-15.5977, 11.8816],
  'Guyana': [-58.1551, 6.8013],
  'Haiti': [-72.3288, 18.5944],
  'Honduras': [-87.2068, 14.0723],
  'Hungary': [19.0402, 47.4979],
  'Iceland': [-21.8952, 64.1466],
  'India': [72.8777, 19.0760],
  'Indonesia': [106.8456, -6.2088],
  'Iran': [51.3890, 35.6892],
  'Iraq': [44.3661, 33.3152],
  'Ireland': [-6.2603, 53.3498],
  'Israel': [34.7818, 32.0853],
  'Italy': [12.4964, 41.9028],
  'Jamaica': [-76.7936, 17.9714],
  'Japan': [139.6917, 35.6895],
  'Jordan': [35.9106, 31.9454],
  'Kazakhstan': [76.9286, 43.2220],
  'Kenya': [36.8219, -1.2921],
  'Kiribati': [172.9791, 1.3382],
  'Korea (North)': [125.7625, 39.0392],
  'Korea (South)': [126.9780, 37.5665],
  'Kuwait': [47.9783, 29.3759],
  'Kyrgyzstan': [74.5698, 42.8746],
  'Laos': [102.6331, 17.9757],
  'Latvia': [24.1052, 56.9496],
  'Lebanon': [35.5018, 33.8938],
  'Lesotho': [27.4869, -29.3142],
  'Liberia': [-10.8047, 6.3156],
  'Libya': [13.1913, 32.8872],
  'Liechtenstein': [9.5215, 47.1410],
  'Lithuania': [25.2797, 54.6872],
  'Luxembourg': [6.1296, 49.6116],
  'Madagascar': [47.5079, -18.8792],
  'Malawi': [33.7741, -13.9626],
  'Malaysia': [101.6869, 3.1390],
  'Maldives': [73.5093, 4.1755],
  'Mali': [-8.0029, 12.6392],
  'Malta': [14.5146, 35.8989],
  'Marshall Islands': [171.1845, 7.1315],
  'Mauritania': [-15.9785, 18.0735],
  'Mauritius': [57.5012, -20.1609],
  'Mexico': [-99.1332, 19.4326],
  'Micronesia': [158.1611, 6.9248],
  'Moldova': [28.8638, 47.0105],
  'Monaco': [7.4246, 43.7384],
  'Mongolia': [106.9057, 47.8864],
  'Montenegro': [19.2636, 42.4304],
  'Morocco': [-7.5898, 33.5731],
  'Mozambique': [32.5732, -25.9692],
  'Myanmar': [96.1951, 16.8409],
  'Namibia': [17.0658, -22.5609],
  'Nauru': [166.9315, -0.5228],
  'Nepal': [85.3240, 27.7172],
  'Netherlands': [4.9041, 52.3676],
  'New Zealand': [174.7633, -36.8485],
  'Nicaragua': [-86.2362, 12.1328],
  'Niger': [2.1098, 13.5137],
  'Nigeria': [3.3792, 6.5244],
  'North Macedonia': [21.4254, 41.9981],
  'Norway': [10.7522, 59.9139],
  'Oman': [58.5922, 23.5880],
  'Pakistan': [67.0099, 24.8607],
  'Palau': [134.4795, 7.5000],
  'Palestine': [35.2332, 31.9038],
  'Panama': [-79.5199, 8.9824],
  'Papua New Guinea': [147.1803, -9.4438],
  'Paraguay': [-57.5759, -25.2637],
  'Peru': [-77.0428, -12.0464],
  'Philippines': [120.9842, 14.5995],
  'Poland': [21.0122, 52.2297],
  'Portugal': [-9.1393, 38.7223],
  'Qatar': [51.5310, 25.2854],
  'Romania': [26.1025, 44.4268],
  'Russia': [37.6173, 55.7558],
  'Rwanda': [30.0619, -1.9403],
  'Saint Kitts and Nevis': [-62.7177, 17.3026],
  'Saint Lucia': [-60.9789, 13.9094],
  'Saint Vincent and the Grenadines': [-61.1971, 13.1600],
  'Samoa': [-171.7513, -13.8333],
  'San Marino': [12.4578, 43.9424],
  'Sao Tome and Principe': [6.7273, 0.3365],
  'Saudi Arabia': [46.6753, 24.7136],
  'Senegal': [-17.4677, 14.7167],
  'Serbia': [20.4489, 44.7866],
  'Seychelles': [55.4540, -4.6796],
  'Sierra Leone': [-13.2317, 8.4657],
  'Singapore': [103.8198, 1.3521],
  'Slovakia': [17.1077, 48.1486],
  'Slovenia': [14.5058, 46.0569],
  'Solomon Islands': [159.9729, -9.4280],
  'Somalia': [45.3182, 2.0469],
  'South Africa': [18.4241, -33.9249],
  'South Sudan': [31.5825, 4.8594],
  'Spain': [2.1734, 41.3851],
  'Sri Lanka': [79.8612, 6.9271],
  'Sudan': [32.5599, 15.5007],
  'Suriname': [-55.2038, 5.8520],
  'Sweden': [18.0686, 59.3293],
  'Switzerland': [8.5417, 47.3769],
  'Syria': [36.2765, 33.5138],
  'Taiwan': [121.5654, 25.0330],
  'Tajikistan': [68.7870, 38.5598],
  'Tanzania': [39.2083, -6.7924],
  'Thailand': [100.5018, 13.7563],
  'Timor-Leste': [125.5736, -8.5569],
  'Togo': [1.2255, 6.1375],
  'Tonga': [-175.1982, -21.1789],
  'Trinidad and Tobago': [-61.5087, 10.6918],
  'Tunisia': [10.1658, 36.8065],
  'Turkey': [28.9784, 41.0082],
  'Turkmenistan': [58.3794, 37.9601],
  'Tuvalu': [179.1940, -8.5167],
  'Uganda': [32.5825, 0.3476],
  'Ukraine': [30.5234, 50.4501],
  'United Arab Emirates': [55.2708, 25.2048],
  'United Kingdom': [-0.1276, 51.5074],
  'United States': [-74.0060, 40.7128],
  'Uruguay': [-56.1645, -34.9011],
  'Uzbekistan': [69.2401, 41.2995],
  'Vanuatu': [168.3273, -17.7334],
  'Vatican City': [12.4534, 41.9029],
  'Venezuela': [-66.9036, 10.4806],
  'Vietnam': [106.6297, 10.8231],
  'Yemen': [44.2075, 15.3694],
  'Zambia': [28.2871, -15.3875],
  'Zimbabwe': [31.0522, -17.8252],
};

interface FacilitatorWorldMapProps {
  facilitatorCounts: Record<string, number>;
  selectedCountry: string | null;
  onCountrySelect: (country: string | null) => void;
}

const FacilitatorWorldMap = memo(function FacilitatorWorldMap({
  facilitatorCounts,
  selectedCountry,
  onCountrySelect,
}: FacilitatorWorldMapProps) {
  const [zoom, setZoom] = useState(1);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [world, setWorld] = useState<Topology | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRef = useRef<{ dragging: boolean; startX: number; startY: number; startPanX: number; startPanY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Get markers for countries with facilitators
  const markers = useMemo(() => {
    return Object.entries(facilitatorCounts)
      .filter(([country]) => countryCoordinates[country])
      .map(([country, count]) => ({
        country,
        coordinates: countryCoordinates[country],
        count,
      }));
  }, [facilitatorCounts]);

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.5, 8));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.5, 1));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onCountrySelect(null);
  };

  const handleMarkerClick = (country: string) => {
    if (selectedCountry === country) {
      onCountrySelect(null);
    } else {
      onCountrySelect(country);
      setPan({ x: 0, y: 0 });
      setZoom(3);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(geoUrl);
        const json = (await res.json()) as Topology;
        if (!cancelled) setWorld(json);
      } catch (e) {
        console.error('Failed to load world map:', e);
        if (!cancelled) setWorld(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const width = 800;
  const height = 400;

  const projection = useMemo(() => {
    // A pragmatic projection setup that matches the prior layout (responsive via viewBox).
    return geoMercator().scale(120).translate([width / 2, height / 2]);
  }, [width, height]);

  const path = useMemo(() => geoPath(projection), [projection]);

  const countries = useMemo(() => {
    if (!world) return [] as any[];
    const obj = world.objects?.countries;
    if (!obj) return [] as any[];
    const fc = feature(world as any, obj as any) as any;
    return fc?.features ?? [];
  }, [world]);

  const markerPoints = useMemo(() => {
    return markers
      .map(({ country, coordinates, count }) => {
        const pt = projection(coordinates as any) as [number, number] | null;
        if (!pt) return null;
        return { country, count, x: pt[0], y: pt[1] };
      })
      .filter(Boolean) as Array<{ country: string; count: number; x: number; y: number }>;
  }, [markers, projection]);

  const onPointerDown: React.PointerEventHandler<SVGSVGElement> = (e) => {
    panRef.current.dragging = true;
    panRef.current.startX = e.clientX;
    panRef.current.startY = e.clientY;
    panRef.current.startPanX = pan.x;
    panRef.current.startPanY = pan.y;
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (e) => {
    if (!panRef.current.dragging) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    setPan({ x: panRef.current.startPanX + dx, y: panRef.current.startPanY + dy });
  };

  const endPan: React.PointerEventHandler<SVGSVGElement> = (e) => {
    panRef.current.dragging = false;
    (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected Country Badge */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-4 z-10"
          >
            <div className="flex items-center gap-2 bg-highlight text-white px-4 py-2 rounded-full shadow-lg">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">{selectedCountry}</span>
              <span className="text-white/80">
                ({facilitatorCounts[selectedCountry]} facilitator{facilitatorCounts[selectedCountry] !== 1 ? 's' : ''})
              </span>
              <button
                onClick={() => onCountrySelect(null)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredCountry && !selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-highlight" />
              <span className="font-medium text-gray-900">{hoveredCountry}</span>
              <span className="text-gray-500">
                ({facilitatorCounts[hoveredCountry]} facilitator{facilitatorCounts[hoveredCountry] !== 1 ? 's' : ''})
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[400px] touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        <g
          style={{
            transformOrigin: `${width / 2}px ${height / 2}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Countries */}
          {countries.map((geo: any) => {
            const d = path(geo);
            if (!d) return null;
            return (
              <path
                key={geo.id ?? geo.properties?.name ?? Math.random()}
                d={d}
                fill="#e5e7eb"
                stroke="#d1d5db"
                strokeWidth={0.5 / zoom}
                style={{ outline: 'none' }}
              />
            );
          })}

          {/* Markers */}
          {markerPoints.map(({ country, count, x, y }) => (
            <g
              key={country}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => handleMarkerClick(country)}
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
              style={{ transform: selectedCountry === country ? 'scale(1.03)' : 'scale(1)' }}
            >
              {selectedCountry === country && (
                <circle
                  cx={x}
                  cy={y}
                  r={12 / zoom}
                  fill="none"
                  stroke="#00CDAC"
                  strokeWidth={2 / zoom}
                  className="animate-pulse"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={Math.min(4 + count * 0.5, 10) / zoom}
                fill="#00CDAC"
                stroke="#fff"
                strokeWidth={1.5 / zoom}
                opacity={selectedCountry && selectedCountry !== country ? 0.4 : 1}
              />
              {count > 1 && zoom >= 2 && (
                <text
                  x={x}
                  y={y - 12 / zoom}
                  textAnchor="middle"
                  className="fill-gray-700 font-semibold"
                  style={{ fontSize: `${10 / zoom}px` }}
                >
                  {count}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-highlight" />
            <span className="text-gray-600">{markers.length} Countries</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-highlight" />
            <span className="text-gray-600">
              {Object.values(facilitatorCounts).reduce((a, b) => a + b, 0)} Facilitators
            </span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="text-gray-500 text-xs">Click markers to filter</span>
        </div>
      </div>
    </div>
  );
});

export default FacilitatorWorldMap;
