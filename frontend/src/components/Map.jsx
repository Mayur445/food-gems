import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Map({ spots }) {
  // Calculate center from first spot or default to Bengaluru
  const center = spots.length > 0
    ? [spots[0].latitude, spots[0].longitude]
    : [12.9716, 77.5946];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {spots.map((spot) => (
        spot.latitude && spot.longitude ? (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
          >
            <Popup>
              <div style={{ minWidth: '180px' }}>
                {spot.photos && spot.photos.length > 0 && (
                  <img
                    src={spot.photos[0].url}
                    alt={spot.name}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}
                  />
                )}
                <h3 style={{
                  fontSize: '15px',
                  fontFamily: 'Playfair Display, serif',
                  color: '#1A1A2E',
                  marginBottom: '4px'
                }}>
                  {spot.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  📍 {spot.city}
                </p>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  ⭐ {spot.avgRating > 0 ? spot.avgRating.toFixed(1) : 'New'} · {spot.category}
                </p>
                <Link
                  to={`/spots/${spot.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    backgroundColor: '#E8741A',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  View Spot →
                </Link>
              </div>
            </Popup>
          </Marker>
        ) : null
      ))}
    </MapContainer>
  );
}

export default Map;