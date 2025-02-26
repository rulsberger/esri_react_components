import WebMap from "@arcgis/core/WebMap";
import MapView from "@arcgis/core/views/MapView";

const app: { view?: __esri.MapView } = {};

/**
 * Initializes the MapView.
 * 
 * @param {HTMLDivElement} container - The HTML element to contain the MapView.
 * @returns {Promise<__esri.MapView>} A promise that resolves to the initialized MapView.
 */
export async function init(container: HTMLDivElement): Promise<__esri.MapView> {
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
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: "top-right",
        breakpoint: false
      }
    }
  });

  app.view = view;

  return view;
}

/**
 * Cleans up the MapView by destroying it.
 */
export function cleanup() {
  app.view?.destroy();
}