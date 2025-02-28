import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

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
      console.log("Created new FeatureLayer", featureLayer);

      // Copy the popupTemplate from the source layer
      if (sublayer.popupTemplate) {
        featureLayer.popupTemplate = sublayer.popupTemplate.clone();
      }
      featureLayer.visible = true; // Ensure the layer is visible

      // Add the feature layer to the map
      mapView.map.add(featureLayer);

      // Wait for the layer view to be created
      const featureLayerView = await mapView.whenLayerView(featureLayer);
      console.log(`FeatureLayerView created for ${sublayer.title}`);
      console.log("FeatureLayerView", featureLayerView);

      // Create a feature filter
      const featureFilter = new FeatureFilter({
        geometry: geometry,
        spatialRelationship: "intersects",
        where: "1=1", // Example where clause, adjust as needed
      });

      // Apply the filter to the layer view
      featureLayerView.filter = featureFilter;
      console.log("Feature Filter", featureLayerView);

      // Create a feature effect
      const featureEffect = new FeatureEffect({
        excludedEffect: "opacity(30%)", // De-emphasize non-matching features
        includedEffect: "brightness(200%) hue-rotate(180deg)", // Highlights in blue
        filter: featureFilter,
        excludedLabelsVisible: false,
      });
      featureLayerView.featureEffect = featureEffect;

      // Wait for the layer view to finish updating
      await reactiveUtils.when(() => !featureLayerView.dataUpdating);

      // Query all the features available for drawing
      const query = featureLayer.createQuery();
      query.geometry = geometry;
      query.returnGeometry = true;
      query.outFields = ["*"];

      const featureSet = await featureLayer.queryFeatures(query);
      console.log("FeatureSet", featureSet);

      console.log(`Features in ${sublayer.title}:`, featureSet);
      if (featureSet.features.length === 0) {
        console.log(`No features found in ${sublayer.title}`);
        return null;
      }

      const queryResult: LayerQueryResults = {
        layerName: featureLayer.title || "Unnamed Layer",
        layer: featureLayer,
        results: featureSet.features.map((feature) => ({
          objectId: feature.attributes.OBJECTID,
          attributes: feature.attributes,
          geometry: feature.geometry,
        })),
      };

      console.log("Query Results", queryResult);
      return queryResult;
    } catch (error) {
      console.error("Error querying feature layer:", error);
      return null;
    }
  }
}