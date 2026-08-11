import { Playlist } from "@/context/AudioPlayerContext";

// URLs de streams de audio directos, de alta disponibilidad e infraestructuras CDN estándar
export const PRESET_PLAYLISTS: Playlist[] = [
  {
    id: "barber-shop",
    name: "Barber Shop",
    icon: "💈",
    description: "Música ambiente equilibrada ideal para la jornada diaria en barbería",
    tracks: [
      {
        id: "bs-1",
        title: "Barber Vibes (Lofi Lounge)",
        artist: "BarberOS Ambient",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      },
      {
        id: "bs-2",
        title: "Urban Smooth Rhythms",
        artist: "BarberOS Ambient",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      },
      {
        id: "bs-3",
        title: "Coffee & Haircut Session",
        artist: "BarberOS Ambient",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      },
    ],
  },
  {
    id: "barber-energy",
    name: "Barber Energy",
    icon: "🔥",
    description: "Ritmos dinámicos y energéticos para mantener la mejor vibra en horas pico",
    tracks: [
      {
        id: "be-1",
        title: "High Energy Peak Hour",
        artist: "BarberOS Energy",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      },
      {
        id: "be-2",
        title: "Modern Upbeat Session",
        artist: "BarberOS Energy",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      },
      {
        id: "be-3",
        title: "Urban Power Beats",
        artist: "BarberOS Energy",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      },
    ],
  },
  {
    id: "barber-chill",
    name: "Barber Chill",
    icon: "😎",
    description: "Sonidos ultra relajados para sesiones de spa, barba y afeitado tradicional",
    tracks: [
      {
        id: "bc-1",
        title: "Relaxing Spa & Beard Lounge",
        artist: "BarberOS Chill",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      },
      {
        id: "bc-2",
        title: "Soft Acoustic Sunset",
        artist: "BarberOS Chill",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      },
      {
        id: "bc-3",
        title: "Deep Shave Relax",
        artist: "BarberOS Chill",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
      },
    ],
  },
  {
    id: "classic-barber",
    name: "Classic Barber",
    icon: "🎸",
    description: "Clásicos, Blues y Rock atemporal para un estilo tradicional y elegante",
    tracks: [
      {
        id: "cb-1",
        title: "Vintage Rock & Blues",
        artist: "BarberOS Classic",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      },
      {
        id: "cb-2",
        title: "Classic Barber Guitar Jam",
        artist: "BarberOS Classic",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
      },
      {
        id: "cb-3",
        title: "Golden Era Rhythms",
        artist: "BarberOS Classic",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
      },
    ],
  },
];
