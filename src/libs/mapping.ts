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
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: "top-right",
        breakpoint: false
      }
    }
  });

  app.view = view;
  
  // view.on("click", (event) => {
  //   console.log('click')
  //   const mapPoint = event.mapPoint;
  //   if (mapPoint) {
  //     view.openPopup({
  //       title: "Clicked Location",
  //       content: `X: ${mapPoint?.x}, Y: ${mapPoint?.y}`,
  //       location: mapPoint
  //     });
  //   }
  // });

  return view;
}

export function cleanup() {
  app.view?.destroy();
}