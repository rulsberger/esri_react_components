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
      portalItem: {
        id: "3f9ccddd607246779286e96847845c3f"
      }
  });

  const view = new MapView({
    map: webMap,
    container,
    center: [-122.465973, 47.258728],
    zoom: 9,
  });

  app.view = view;

  return view;
}

export function cleanup() {
  app.view?.destroy();
}