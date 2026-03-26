// deliveryZones.ts
interface DeliveryZone {
  center: { lat: number; lng: number };
  radius: number; // in kilometers
  city: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: string;
}

export const checkDeliveryAvailability = (
  latitude: number,
  longitude: number,
  zones: DeliveryZone[]
): { available: boolean; zone: DeliveryZone | null; message: string } => {
  for (const zone of zones) {
    const distance = calculateDistance(
      latitude,
      longitude,
      zone.center.lat,
      zone.center.lng
    );
    
    if (distance <= zone.radius) {
      return {
        available: true,
        zone,
        message: `Delivery available in ${zone.city}`,
      };
    }
  }
  
  return {
    available: false,
    zone: null,
    message: 'Sorry, delivery is not available in your area yet.',
  };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};