import santorini from '../../assets/pixel-brush/santorini.png'
import street from '../../assets/pixel-brush/street.png'
import cherry from '../../assets/pixel-brush/cherry.png'
import dog from '../../assets/pixel-brush/dog.png'
import christmas from '../../assets/christmas-night.png'

// Temporary local assets; final user-selected photographs are still pending.
export const pixelPhotos = [
  { id: 'santorini', src: santorini, label: 'Santorini sunset' },
  { id: 'street', src: street, label: 'Afternoon street' },
  { id: 'cherry', src: cherry, label: 'Cherry blossoms' },
  { id: 'dog', src: dog, label: 'Golden retriever' },
  { id: 'christmas', src: christmas, label: 'New York winter night' },
] as const
