import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

/**
 * Represents the result of a query.
 */
export interface QueryResult {
  /** The object ID of the feature. */
  objectId: number;
  /** The attributes of the feature. */
  attributes: Record<string, any>;
  /** The geometry of the feature. */
  geometry?: __esri.Geometry;
}

/**
 * Represents the results of a query for a specific layer.
 */
export interface LayerQueryResults {
  /** The name of the layer. */
  layerName: string;
  /** The feature layer. */
  layer: __esri.FeatureLayer;
  /** The results of the query. */
  results: QueryResult[];
}

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

  async function querySublayer(layer: __esri.Sublayer) {
    // TODO: Research the SubLayer QueryTask I should be able to just get the LayerView Returned and use the queryFeatures method on a layer that already exists.
    if (!layer.url || (onlyVisible && !layer.visible)) return;

    try {
        // Creating a new FeatureLayer from the URL
        const featureLayer = new FeatureLayer({ url: layer.url });
        featureLayer.popupTemplate = layer.popupTemplate;

      const query = featureLayer.createQuery();
      query.geometry = geometry;
      query.returnGeometry = true;
      query.outFields = ["*"];

      const result = await featureLayer.queryFeatures(query);
      if (result.features.length > 0) {
        resultsByLayer.push({
          layerName: layer.title || "Unnamed Layer",
          layer: featureLayer,
          results: result.features.map(feature => ({
            objectId: feature.attributes.OBJECTID,
            attributes: feature.attributes,
            geometry: feature.geometry
          }))
        });
      }
    } catch (error) {
      console.error('Error querying sublayer:', error);
    }
  }

  async function traverseLayers(layer: __esri.MapImageLayer) {
    const allLayers = layer.allSublayers.toArray(); // Assuming this returns an array

    allLayers.filter( async (sublayer : __esri.Sublayer) => {
      if (!sublayer.sublayers) {
        await querySublayer(sublayer);
      }
    } );
  }

  for (const layer of mapView.map.layers.toArray()) {
    // TODO: Handle All LayerTypes 
    // if (layer if instanceof MapImageLayer)
    if (layer.type == "map-image") {
      await traverseLayers(layer as MapImageLayer);
    }
  }

  return resultsByLayer;
}
