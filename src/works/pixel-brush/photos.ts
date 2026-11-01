import cherryNight from '../../assets/pixel-brush/selected/optimized/cherry-night.jpg'
import flightWindow from '../../assets/pixel-brush/selected/optimized/flight-window.jpg'
import cityWalk from '../../assets/pixel-brush/selected/optimized/city-walk.jpg'
import hollywood from '../../assets/pixel-brush/selected/optimized/hollywood.jpg'
import rainyEvening from '../../assets/pixel-brush/selected/optimized/rainy-evening.jpg'
import campusLawn from '../../assets/pixel-brush/selected/optimized/campus-lawn.jpg'

// User-selected images in submission order; the first is also the gallery/loading preview.
export const pixelPhotos = [
  { id: 'cherry-night', src: cherryNight, label: 'Cherry blossoms at night' },
  { id: 'flight-window', src: flightWindow, label: 'View from an airplane' },
  { id: 'city-walk', src: cityWalk, label: 'City walk' },
  { id: 'hollywood', src: hollywood, label: 'Hollywood hillside' },
  { id: 'rainy-evening', src: rainyEvening, label: 'Rainy evening' },
  { id: 'campus-lawn', src: campusLawn, label: 'Afternoon on the lawn' },
] as const
