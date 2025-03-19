import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

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

  // set up the states layer. It will be used as the basemap
  const states = new FeatureLayer({
    url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/2",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: "#f0ebe4",
        outline: {
          color: "#DCDCDC",
          width: "0.5px"
        }
      }
    },
    effect: "drop-shadow(-10px, 10px, 6px gray)"
  });

  // national park service establishments feature service
  const nps_Establishments = new FeatureLayer({
    portalItem: { id: "d72ab790752142bd9dfb190c79d6582b" }
  });
  

  const webMap = new Map({
    basemap: "streets-vector",
  })

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