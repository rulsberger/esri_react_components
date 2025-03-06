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

        // Query the sublayer if it has no sublayers
        const result = await QueryService.queryFeatureLayer(mapView, sublayer, geometry);
        if (result) {
          resultsByLayer.push(result);
        }
      }
    }
  }

  // Loop through webmap's operational layers
  const layerPromises = mapView.map.layers.map(async (layer) => {
    try {
      const layerView = await mapView.whenLayerView(layer);
      if (layer.type === "map-image") {
        await traverseLayers(layer as unknown as __esri.MapImageLayer);
      }
    } catch (error) {
      console.error(error);
    }
  });

  // Wait for all layer promises to complete
  await Promise.all(layerPromises);
  return resultsByLayer;
}
