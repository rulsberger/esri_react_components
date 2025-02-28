import QueryService, { LayerQueryResults } from "./QueryService";

/**
 * Queries features by geometry.
 * 
 * @param mapView - The map view to query.
 * @param geometry - The geometry to use for the query.
 * @param onlyVisible - Whether to query only visible layers.
 * @returns A promise that resolves to an array of layer query results.
 */
export default async function queryByGeometry(  
  mapView: __esri.MapView,
  geometry: __esri.Geometry,
  onlyVisible: boolean
): Promise<LayerQueryResults[]> {
  const resultsByLayer: LayerQueryResults[] = [];

  async function traverseLayers(layer: __esri.Sublayer | __esri.MapImageLayer) {
    const allLayers = layer.sublayers ? layer.sublayers.toArray() : [];

    for (const sublayer of allLayers) {
      if (sublayer.sublayers && sublayer.sublayers.length > 0) {
        // Recursively traverse sublayers
        await traverseLayers(sublayer);
      } else if (sublayer.url && (!onlyVisible || sublayer.visible)) {
        console.log("Query Sublayer", sublayer.title);
        console.log("Sublayer", sublayer);
        // Query the sublayer if it has no sublayers
        const result = await QueryService.queryFeatureLayer(sublayer.url, geometry, sublayer.popupTemplate);
        if (result) {
          console.log("Query Results", result);
          resultsByLayer.push(result);
        }
      }
    }
  }

  // loop through webmap's operational layers
  mapView.map.layers.forEach((layer, index) => {
    mapView
      .whenLayerView(layer)
      .then((layerView) => {
        if (layer.type === "map-image") {
          traverseLayers(layer as unknown as __esri.MapImageLayer);
        }
      })
      .catch(console.error);
  });

  console.log(resultsByLayer)
  return resultsByLayer;
}
