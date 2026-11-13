
"use strict";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register(
          "./service-worker.js"
        );

      console.log(
        "Arbeitszeit-PWA registriert:",
        registration.scope
      );
    } catch (error) {
      console.error(
        "PWA-Registrierung fehlgeschlagen:",
        error
      );
    }
  });
}
