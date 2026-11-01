import cherryNight from '../../assets/pixel-brush/selected/cherry-night.png'
import flightWindow from '../../assets/pixel-brush/selected/flight-window.png'
import cityWalk from '../../assets/pixel-brush/selected/city-walk.png'
import hollywood from '../../assets/pixel-brush/selected/hollywood.png'
import rainyEvening from '../../assets/pixel-brush/selected/rainy-evening.png'
import campusLawn from '../../assets/pixel-brush/selected/campus-lawn.jpg'

// User-selected images in submission order; the first is also the gallery/loading preview.
export const pixelPhotos = [
  { id: 'cherry-night', src: cherryNight, label: 'Cherry blossoms at night' },
  { id: 'flight-window', src: flightWindow, label: 'View from an airplane' },
  { id: 'city-walk', src: cityWalk, label: 'City walk' },
  { id: 'hollywood', src: hollywood, label: 'Hollywood hillside' },
  { id: 'rainy-evening', src: rainyEvening, label: 'Rainy evening' },
  { id: 'campus-lawn', src: campusLawn, label: 'Afternoon on the lawn' },
] as const
