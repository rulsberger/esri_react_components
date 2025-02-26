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

  async function traverseLayers(layer: __esri.MapImageLayer) {
    const allLayers = layer.allSublayers.toArray();

    for (const sublayer of allLayers) {
      if (!sublayer.sublayers && sublayer.url && (!onlyVisible || sublayer.visible)) {
        const result = await QueryService.queryFeatureLayer(sublayer.url, geometry, sublayer.popupTemplate);
        if (result) {
          console.log(result);
          resultsByLayer.push(result);
        }
      }
    }
  }

  for (const layer of mapView.map.layers.toArray()) {
    if (layer.type === "map-image") {
      await traverseLayers(layer as __esri.MapImageLayer);
    }
  }

  return resultsByLayer;
}
