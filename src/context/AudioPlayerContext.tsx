"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  icon: string;
  description: string;
  tracks: Track[];
}

interface AudioPlayerContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentPlaylist: Playlist | null;
  trackIndex: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  currentTime: number;
  duration: number;
  playbackSource: "PRESET" | "LOCAL";
  localTracks: Track[];
  playTrack: (track: Track, playlist?: Playlist | null, index?: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  seekTo: (time: number) => void;
  loadLocalFiles: (files: FileList | File[]) => Promise<void>;
  deleteLocalTrack: (id: string) => Promise<void>;
  clearLocalTracks: () => Promise<void>;
  selectPlaylist: (playlist: Playlist) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

import {
  saveLocalTracksToDB,
  getLocalTracksFromDB,
  deleteLocalTrackFromDB,
  clearAllLocalTracksFromDB,
} from "@/lib/music/musicStorage";

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("all");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackSource, setPlaybackSource] = useState<"PRESET" | "LOCAL">("PRESET");
  const [localTracks, setLocalTracks] = useState<Track[]>([]);

  // Cargar canciones de IndexedDB al iniciar la app
  useEffect(() => {
    async function loadSavedTracks() {
      try {
        const stored = await getLocalTracksFromDB();
        if (stored.length > 0) {
          const tracks: Track[] = stored.map((item) => ({
            id: item.id,
            title: item.name,
            artist: "Mi PC (Guardado)",
            url: URL.createObjectURL(item.blob),
            isLocal: true,
          }));
          setLocalTracks(tracks);
        }
      } catch (e) {
        console.error("Error al cargar canciones locales de IndexedDB:", e);
      }
    }
    loadSavedTracks();
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleNextTrackRef.current();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const handleNextTrackRef = useRef<() => void>(() => {});

  const playTrack = (track: Track, playlist: Playlist | null = null, index: number = 0) => {
    if (!audioRef.current) return;
    
    setCurrentTrack(track);
    if (playlist) setCurrentPlaylist(playlist);
    setTrackIndex(index);

    audioRef.current.src = track.url;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error("Error playing audio track:", err));
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Error toggling play:", err));
    }
  };

  const activeTracksList = (): Track[] => {
    if (playbackSource === "LOCAL") return localTracks;
    return currentPlaylist ? currentPlaylist.tracks : [];
  };

  const nextTrack = () => {
    const tracks = activeTracksList();
    if (tracks.length === 0) return;

    if (repeatMode === "one" && currentTrack) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIdx = trackIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else if (nextIdx >= tracks.length) {
      if (repeatMode === "all") {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    playTrack(tracks[nextIdx], currentPlaylist, nextIdx);
  };

  handleNextTrackRef.current = nextTrack;

  const prevTrack = () => {
    const tracks = activeTracksList();
    if (tracks.length === 0) return;

    let prevIdx = trackIndex - 1;
    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * tracks.length);
    } else if (prevIdx < 0) {
      prevIdx = tracks.length - 1;
    }

    playTrack(tracks[prevIdx], currentPlaylist, prevIdx);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  const seekTo = (time: number) => {
    if (audioRef.current && !isNaN(time)) {
      try {
        if ("fastSeek" in audioRef.current && typeof audioRef.current.fastSeek === "function") {
          audioRef.current.fastSeek(time);
        } else {
          audioRef.current.currentTime = time;
        }
        setCurrentTime(time);
      } catch (err) {
        console.warn("Seek error:", err);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };

  const loadLocalFiles = async (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|ogg|flac|aac)$/i.test(file.name)
    );

    if (audioFiles.length === 0) return;

    // Guardar persistentemente en IndexedDB
    const stored = await saveLocalTracksToDB(audioFiles);

    const newTracks: Track[] = stored.map((item) => ({
      id: item.id,
      title: item.name,
      artist: "Mi PC",
      url: URL.createObjectURL(item.blob),
      isLocal: true,
    }));

    const combinedTracks = [...localTracks, ...newTracks];

    setLocalTracks(combinedTracks);
    setPlaybackSource("LOCAL");
    const localPlaylist: Playlist = {
      id: "local-playlist",
      name: "Mi Música Local",
      icon: "📁",
      description: "Canciones cargadas desde tu computadora",
      tracks: combinedTracks,
    };
    setCurrentPlaylist(localPlaylist);
    
    // Reproducir la primera canción cargada
    const startIndex = localTracks.length;
    playTrack(combinedTracks[startIndex], localPlaylist, startIndex);
  };

  const deleteLocalTrack = async (id: string) => {
    await deleteLocalTrackFromDB(id);
    const updated = localTracks.filter((t) => t.id !== id);
    setLocalTracks(updated);
    if (currentPlaylist?.id === "local-playlist") {
      setCurrentPlaylist({
        ...currentPlaylist,
        tracks: updated,
      });
    }
  };

  const clearLocalTracks = async () => {
    await clearAllLocalTracksFromDB();
    setLocalTracks([]);
    if (playbackSource === "LOCAL") {
      setCurrentPlaylist(null);
      setCurrentTrack(null);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const selectPlaylist = (playlist: Playlist) => {
    setPlaybackSource("PRESET");
    setCurrentPlaylist(playlist);
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist, 0);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        isPlaying,
        currentTrack,
        currentPlaylist,
        trackIndex,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        currentTime,
        duration,
        playbackSource,
        localTracks,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        seekTo,
        loadLocalFiles,
        deleteLocalTrack,
        clearLocalTracks,
        selectPlaylist,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {

  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};
