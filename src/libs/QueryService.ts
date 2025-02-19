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
  layer: __esri.FeatureLayer;
  results: QueryResult[];
}

/**
 * Queries a FeatureLayer by geometry.
 *
 * @param layerUrl - The URL of the FeatureLayer to query.
 * @param geometry - The geometry to use for the query.
 * @param sourcePopupTemplate - The popup template from the source layer to copy.
 * @returns A promise that resolves to LayerQueryResults or null if no features are found.
 */
export default class QueryService {
    static async queryFeatureLayer(
      layerUrl: string,
      geometry: __esri.Geometry,
      sourcePopupTemplate?: __esri.PopupTemplate // Accept the source layer's popupTemplate
    ): Promise<LayerQueryResults | null> {
      try {
        // Create a new FeatureLayer from the URL
        const featureLayer = new FeatureLayer({ url: layerUrl });
  
        // Copy the popupTemplate from the source layer
        if (sourcePopupTemplate) {
          featureLayer.popupTemplate = sourcePopupTemplate;
        }
  
        const query = featureLayer.createQuery();
        query.geometry = geometry;
        query.returnGeometry = true;
        query.outFields = ["*"];
  
        const result = await featureLayer.queryFeatures(query);
  
        if (result.features.length === 0) {
          return null;
        }
  
        return {
          layerName: featureLayer.title || "Unnamed Layer",
          layer: featureLayer,
          results: result.features.map(feature => ({
            objectId: feature.attributes.OBJECTID,
            attributes: feature.attributes,
            geometry: feature.geometry
          }))
        };
      } catch (error) {
        console.error("Error querying feature layer:", error);
        return null;
      }
    }
  }