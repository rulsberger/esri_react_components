// import ArcGISMap from "@arcgis/core/Map";
import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";

interface MapApp {
  view?: MapView;
}

const app: MapApp = {};

export async function init(container: HTMLDivElement) {
  if (app.view) {
    app.view.destroy();
  }

  const webMap = new WebMap({
      basemap: 'streets-navigation-vector',
  });

  const view = new MapView({
    map: webMap,
    container,
    center: [-122.465973, 47.258728],
    zoom: 9,
  });

  app.view = view;

  return cleanup;
}

function cleanup() {
  app.view?.destroy();
}