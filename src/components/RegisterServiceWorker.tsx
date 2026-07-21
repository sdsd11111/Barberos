"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registrado con éxito. Scope:", reg.scope);
        })
        .catch((err) => {
          console.error("Fallo al registrar Service Worker:", err);
        });
    }
  }, []);

  return null;
}
