import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

/**
 * Represents the result of a query.
 */
export interface QueryResult {
  objectId: number;
  attributes: Record<string, any>;
  geometry?: __esri.Geometry;
}

/**
 * Represents the results of a query for a specific layer.
 */
export interface LayerQueryResults {
  layerName: string;
  featureLayer: __esri.FeatureLayer;
  // featureLayerView: __esri.LayerView;
  results: QueryResult[];
}

/**
 * Queries a FeatureLayer by geometry.
 *
 * @param mapView - The MapView instance.
 * @param sublayer - The sublayer to query.
 * @param geometry - The geometry to use for the query.
 * @returns A promise that resolves to LayerQueryResults or null if no features are found.
 */
export default class QueryService {
  static async queryFeatureLayer(
    mapView: __esri.MapView,
    sublayer: __esri.Sublayer,
    geometry: __esri.Geometry
  ): Promise<LayerQueryResults | null> {
    try {
      // Create a new FeatureLayer from the URL
      const featureLayer = new FeatureLayer({ url: sublayer.url });
      // Copy the popupTemplate from the source layer
      if (sublayer.popupTemplate) {
        featureLayer.popupTemplate = sublayer.popupTemplate.clone();
      }
      featureLayer.visible = sublayer.visible;

      const query = featureLayer.createQuery();
      query.geometry = geometry;
      query.returnGeometry = true;
      query.outFields = ["*"];

      const featureSet = await featureLayer.queryFeatures(query);

      if (featureSet.features.length === 0) {
        return null;
      }

      const queryResult: LayerQueryResults = {
        layerName: featureLayer.title || "Unnamed Layer",
        featureLayer: featureLayer,
        results: featureSet.features.map((feature) => ({
          objectId: feature.attributes.OBJECTID,
          attributes: feature.attributes,
          geometry: feature.geometry,
        })),
      };

      return queryResult;

    } catch (error) {
      console.error("Error querying feature layer:", error);
      return null;
    }
  }
}
