import config from "@arcgis/core/config";
import ArcGISMap from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Track from "@arcgis/core/widgets/Track";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Point from "@arcgis/core/geometry/Point";

import "./style.css";

config.apiKey = import.meta.env.VITE_API_KEY;

const btn = document.getElementById("btnToggle");

const geolocationOptions = {
  maximumAge: 0,
  timeout: 6000,
  enableHighAccuracy: false,
};

const geoLayer = new GraphicsLayer({
  id: "geolocationLayer",
  title: "Geolocation Layer",
});

const map = new ArcGISMap({
  basemap: "osm-streets",
  layers: [geoLayer],
});

const view = new MapView({
  map,
  container: "app",
});

const track = new Track({
  view,
  // useHeadingEnabled: true,
  geolocationOptions,
});

view.ui.add(track, "top-left");
view.ui.add(btn, "top-right");

let watchId;

view.when(() => {
  nativeLocate();
});

function nativeLocate() {
  // assume navigator
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const point = new Point({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      geoLayer.removeAll();
      geoLayer.add({
        attributes: { ...position },
        geometry: point,
      });

      view.goTo({
        target: point,
        zoom: 16,
      });
    },
    (error) => {
      console.warn(error);
    },
    geolocationOptions
  );
}

btn.addEventListener("click", () => {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    track.start();
  } else {
    track.stop();
    nativeLocate();
  }
});
