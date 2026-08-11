"use client";

import React, { useState, useRef } from "react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { PRESET_PLAYLISTS } from "@/lib/music/playlists";

export default function BarberMusicPlayer() {
  const {
    isPlaying,
    currentTrack,
    currentPlaylist,
    playbackSource,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    trackIndex,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    selectPlaylist,
    loadLocalFiles,
    deleteLocalTrack,
    clearLocalTracks,
    localTracks,
    playTrack,
  } = useAudioPlayer();

  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadLocalFiles(e.target.files);
      setShowPlaylistMenu(false);
    }
  };

  // Determinar la lista de tracks activa para mostrar
  const activeDisplayTracks = playbackSource === "LOCAL"
    ? localTracks
    : currentPlaylist?.tracks || [];

  return (
    <>
      {/* Botón flotante colapsado cuando el reproductor no está visible o minimizado */}
      <div className="fixed bottom-4 left-4 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[#161210]/95 backdrop-blur-md hover:bg-[#221c19] text-[#f3ece1] border border-[#d4af37]/40 shadow-2xl px-3 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all duration-300 group hover:scale-105"
          >
            <div className="relative flex items-center justify-center">
              <span className={`text-lg sm:text-xl ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "4s" }}>
                🎵
              </span>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-[11px] sm:text-xs font-bold text-[#d4af37]">Barber Music</p>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate max-w-[80px] sm:max-w-[130px]">
                {currentTrack ? currentTrack.title : "Música"}
              </p>
            </div>
          </button>
        ) : null}
      </div>

      {/* Reproductor Completo Anclado */}
      {isOpen && (
        <div className="fixed bottom-0 inset-x-0 z-[999] bg-[#120f0e]/95 backdrop-blur-md border-t border-[#d4af37]/30 text-[#f3ece1] shadow-2xl transition-all duration-300">
          {/* Inputs ocultos para carga de archivos locales */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFilesSelect}
            multiple
            accept="audio/*"
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFilesSelect}
            multiple
            accept="audio/*"
            // @ts-expect-error - webkitdirectory es un atributo no estándar soportado por Chrome y navegadores modernos
            webkitdirectory=""
            className="hidden"
          />

          {/* Menú emergente de selección de Playlists y Mi Música */}
          {showPlaylistMenu && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-2 max-h-[60vh] overflow-y-auto">
              <div className="bg-[#1a1614] border border-zinc-800 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 shadow-xl">
                {PRESET_PLAYLISTS.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      selectPlaylist(pl);
                      setShowPlaylistMenu(false);
                      setShowTrackList(false);
                    }}
                    className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-lg border text-left transition-all ${
                      currentPlaylist?.id === pl.id && playbackSource === "PRESET"
                        ? "bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]"
                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{pl.icon}</span>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold truncate">{pl.name}</p>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{pl.description}</p>
                    </div>
                  </button>
                ))}

                {/* Opción Mi Música */}
                <div
                  className={`flex flex-col justify-between p-2.5 sm:p-3 rounded-lg border text-left transition-all ${
                    playbackSource === "LOCAL"
                      ? "bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37]"
                      : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🎵</span>
                    <div>
                      <p className="text-xs font-bold">Mi música</p>
                      <p className="text-[10px] text-zinc-400">
                        {localTracks.length > 0 ? `${localTracks.length} canciones` : "Desde tu PC"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-medium py-1 px-2 rounded text-center transition"
                    >
                      + Archivos
                    </button>
                    <button
                      onClick={() => folderInputRef.current?.click()}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-medium py-1 px-2 rounded text-center transition"
                    >
                      + Carpeta
                    </button>
                  </div>
                  {localTracks.length > 0 && (
                    <button
                      onClick={() => {
                        setShowPlaylistMenu(false);
                        setShowTrackList(true);
                      }}
                      className="mt-1.5 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[10px] font-medium py-1 px-2 rounded text-center text-[#d4af37] transition border border-[#d4af37]/30"
                    >
                      📋 Ver mis canciones
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Panel de lista de canciones */}
          {showTrackList && (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-2">
              <div className="bg-[#1a1614] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                {/* Header de la lista */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-sm flex-shrink-0">
                      {playbackSource === "LOCAL" ? "🎵" : currentPlaylist?.icon || "🎵"}
                    </span>
                    <h3 className="text-xs font-bold text-[#d4af37] truncate">
                      {playbackSource === "LOCAL"
                        ? `Mi Música (${localTracks.length})`
                        : `${currentPlaylist?.name || "Playlist"} (${activeDisplayTracks.length})`
                      }
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {playbackSource === "LOCAL" && localTracks.length > 0 && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[9px] sm:text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition"
                        >
                          + Añadir
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("¿Eliminar todas las canciones guardadas de \"Mi Música\"?")) {
                              await clearLocalTracks();
                            }
                          }}
                          className="text-[9px] sm:text-[10px] bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1 rounded transition"
                        >
                          🗑️ Borrar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowTrackList(false)}
                      className="text-zinc-500 hover:text-white text-xs transition px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Lista scrollable */}
                <div className="max-h-44 sm:max-h-52 overflow-y-auto divide-y divide-zinc-800/50">
                  {activeDisplayTracks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                      <span className="text-xl mb-1">🎵</span>
                      <p className="text-xs">No hay canciones todavía</p>
                    </div>
                  ) : (
                    activeDisplayTracks.map((track, idx) => {
                      const isCurrentTrack = currentTrack?.id === track.id;
                      return (
                        <div
                          key={track.id}
                          className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 hover:bg-zinc-800/50 transition group cursor-pointer ${
                            isCurrentTrack ? "bg-[#d4af37]/5" : ""
                          }`}
                          onClick={() => {
                            const playlist = playbackSource === "LOCAL"
                              ? {
                                  id: "local-playlist",
                                  name: "Mi Música Local",
                                  icon: "📁",
                                  description: "Canciones desde tu PC",
                                  tracks: localTracks,
                                }
                              : currentPlaylist;
                            playTrack(track, playlist, idx);
                          }}
                        >
                          {/* Número o indicador de reproducción */}
                          <div className="w-5 text-center flex-shrink-0">
                            {isCurrentTrack && isPlaying ? (
                              <span className="text-[#d4af37] text-xs animate-pulse">♫</span>
                            ) : isCurrentTrack ? (
                              <span className="text-[#d4af37] text-xs">▶</span>
                            ) : (
                              <span className="text-[10px] text-zinc-500">{idx + 1}</span>
                            )}
                          </div>

                          {/* Info de la canción */}
                          <div className="flex-1 overflow-hidden min-w-0">
                            <p className={`text-xs truncate ${isCurrentTrack ? "text-[#d4af37] font-bold" : "text-[#f3ece1]"}`}>
                              {track.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                              {track.artist || "Desconocido"}
                            </p>
                          </div>

                          {/* Etiqueta de origen y botón de eliminar */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {playbackSource === "LOCAL" && track.isLocal && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await deleteLocalTrack(track.id);
                                }}
                                className="text-zinc-500 hover:text-red-400 text-xs px-1 py-0.5 transition"
                                title="Eliminar canción"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Barra principal del reproductor (Responsiva Celular/Escritorio) */}
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-3">
            {/* Fila Móvil Superior: Info Canción & Selectores */}
            <div className="flex items-center justify-between gap-2 w-full md:w-1/4">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <button
                  onClick={() => {
                    setShowPlaylistMenu(!showPlaylistMenu);
                    if (showTrackList) setShowTrackList(false);
                  }}
                  className="flex items-center gap-1 sm:gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-[#d4af37] text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg border border-zinc-700 transition flex-shrink-0"
                >
                  <span>{currentPlaylist ? currentPlaylist.icon || "🎵" : "🎵"}</span>
                  <span className="truncate max-w-[70px] sm:max-w-[100px]">
                    {currentPlaylist ? currentPlaylist.name : "Playlists"}
                  </span>
                  <span className="text-[9px]">▼</span>
                </button>

                <button
                  onClick={() => {
                    setShowTrackList(!showTrackList);
                    if (showPlaylistMenu) setShowPlaylistMenu(false);
                  }}
                  className={`text-[10px] px-2 py-1.5 rounded-lg border transition flex-shrink-0 ${
                    showTrackList
                      ? "bg-[#d4af37]/10 border-[#d4af37]/40 text-[#d4af37]"
                      : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Ver lista de canciones"
                >
                  📋 {activeDisplayTracks.length}
                </button>

                <div className="overflow-hidden min-w-0">
                  <p className="text-[11px] sm:text-xs font-bold text-[#f3ece1] truncate">
                    {currentTrack ? currentTrack.title : "Sin reproducción"}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
                    {currentTrack ? currentTrack.artist || "Barberos Plus" : "Selecciona una playlist"}
                  </p>
                </div>
              </div>

              {/* Botón Minimizar solo visible en Móvil en la fila superior */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPlaylistMenu(false);
                  setShowTrackList(false);
                }}
                className="md:hidden text-zinc-400 hover:text-white text-xs bg-zinc-800 p-1.5 rounded-lg border border-zinc-700 transition flex-shrink-0"
                title="Minimizar reproductor"
              >
                ✕
              </button>
            </div>

            {/* Transport / Controles principales & Progress Bar */}
            <div className="flex flex-col items-center gap-1 w-full md:w-2/4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleShuffle}
                  title="Modo Aleatorio"
                  className={`text-xs transition ${isShuffle ? "text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  🔀
                </button>
                <button
                  onClick={prevTrack}
                  title="Anterior"
                  className="text-zinc-300 hover:text-white transition text-sm"
                >
                  ⏮️
                </button>
                <button
                  onClick={togglePlay}
                  title={isPlaying ? "Pausar" : "Reproducir"}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[#d4af37] hover:bg-[#c5a028] text-black font-bold shadow-lg transition transform hover:scale-105"
                >
                  {isPlaying ? "⏸️" : "▶️"}
                </button>
                <button
                  onClick={nextTrack}
                  title="Siguiente"
                  className="text-zinc-300 hover:text-white transition text-sm"
                >
                  ⏭️
                </button>
                <button
                  onClick={toggleRepeat}
                  title={`Repetir (${repeatMode})`}
                  className={`text-xs transition relative ${repeatMode !== "off" ? "text-[#d4af37]" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  🔁
                  {repeatMode === "one" && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-[#d4af37] text-black rounded-full px-0.5">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Progress Slider */}
              <div className="flex items-center gap-2 w-full max-w-md text-[9px] sm:text-[10px] text-zinc-400">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control de Volumen & Botón Minimizar en Escritorio */}
            <div className="hidden md:flex items-center justify-end gap-3 w-full md:w-1/4">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <button onClick={toggleMute} className="hover:text-white transition">
                  {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPlaylistMenu(false);
                  setShowTrackList(false);
                }}
                className="text-zinc-400 hover:text-white text-xs bg-zinc-800 p-1.5 rounded-lg border border-zinc-700 transition"
                title="Minimizar reproductor"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

