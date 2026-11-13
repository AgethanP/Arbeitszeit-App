
"use strict";

/*
  Kompakte Uhrzeit-Auswahl für iPhone

  Ersetzt die sichtbare Darstellung nativer
  Uhrzeitfelder durch zwei Auswahlfelder:

  [Stunde] [Minute]

  Die ursprünglichen Eingabefelder bleiben
  erhalten, damit script.js weiterhin
  unverändert funktioniert.
*/

(() => {

  const SELECTOR = [
    "#shiftStart",
    "#shiftEnd",
    ".rule-start",
    ".rule-end"
  ].join(", ");

  function createOptions(max) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < max; i++) {
      const option = document.createElement("option");

      option.value = String(i).padStart(2, "0");
      option.textContent = option.value;

      fragment.appendChild(option);
    }

    return fragment;
  }

  function createTimePicker(input) {

    // Nicht doppelt erstellen
    if (input.dataset.compactPicker === "true") {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "compact-time-picker";

    const hourSelect = document.createElement("select");
    const minuteSelect = document.createElement("select");

    hourSelect.className = "compact-time-hour";
    minuteSelect.className = "compact-time-minute";

    hourSelect.setAttribute(
      "aria-label",
      "Stunde auswählen"
    );

    minuteSelect.setAttribute(
      "aria-label",
      "Minute auswählen"
    );

    hourSelect.appendChild(createOptions(24));
    minuteSelect.appendChild(createOptions(60));

    wrapper.append(hourSelect, minuteSelect);

    // Wert aus dem originalen Uhrzeitfeld lesen
    function syncFromInput() {
      const value = input.value || "00:00";
      const [hours, minutes] = value.split(":");

      hourSelect.value = hours;
      minuteSelect.value = minutes;
    }

    // Neue Uhrzeit an bestehende App übergeben
    function syncToInput() {
      input.value =
        hourSelect.value + ":" + minuteSelect.value;

      // Vorhandene Berechnungen aktualisieren
      input.dispatchEvent(
        new Event("input", { bubbles: true })
      );

      input.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    }

    hourSelect.addEventListener(
      "change",
      syncToInput
    );

    minuteSelect.addEventListener(
      "change",
      syncToInput
    );

    // Referenz zum Synchronisieren speichern
    input._syncCompactTime = syncFromInput;

    // Originale Eingabe unsichtbar machen
    input.dataset.compactPicker = "true";
    input.classList.add("time-picker-source");

    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");

    // Neue Auswahl direkt hinter das Eingabefeld
    input.insertAdjacentElement(
      "afterend",
      wrapper
    );

    syncFromInput();
  }

  function initializePickers() {
    document
      .querySelectorAll(SELECTOR)
      .forEach(createTimePicker);
  }

  function refreshPickers(container) {
    if (!container) return;

    container
      .querySelectorAll(SELECTOR)
      .forEach(input => {
        if (typeof input._syncCompactTime === "function") {
          input._syncCompactTime();
        }
      });
  }

  // Vorhandene Eingabefelder vorbereiten
  initializePickers();

  /*
    Die Zuschlagsfelder werden in script.js
    dynamisch erstellt.

    Deshalb erkennen wir neue Felder
    automatisch.
  */

  const observer = new MutationObserver(() => {
    initializePickers();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  /*
    Beim Öffnen eines Dialogs hat script.js
    bereits die gespeicherten Uhrzeiten
    in die ursprünglichen Felder geschrieben.

    Wir übernehmen diese anschließend
    in unsere Auswahlfelder.
  */

  const dialogs = [
    document.getElementById("shiftDialog"),
    document.getElementById("settingsDialog")
  ];

  dialogs.forEach(dialog => {
    if (!dialog) return;

    const dialogObserver = new MutationObserver(() => {
      if (dialog.open) {
        initializePickers();
        refreshPickers(dialog);
      }
    });

    dialogObserver.observe(dialog, {
      attributes: true,
      attributeFilter: ["open"]
    });
  });

})();
