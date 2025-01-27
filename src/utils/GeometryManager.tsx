import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Collection from "@arcgis/core/core/Collection";
import Sketch from "@arcgis/core/widgets/Sketch";
import Geometry from "@arcgis/core/geometry/Geometry";
import Query from '@arcgis/core/rest/support/Query';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';

type QueriedLayer = {
  name: string;
  features: { label: string; description: string }[];
};

export class GeometryManager {
  private mapView: MapView;
  private sketch: Sketch | null = null;
  private activeGraphic: Graphic | null = null;

  constructor(mapView: MapView) {
    this.mapView = mapView;

    const graphics = new Collection<Graphic>(); // Create a collection of graphics

    const layer = new GraphicsLayer({
      graphics: graphics, // Wrap the graphics in GraphicsLayerProperties
    });

    // Initialize Sketch widget
    this.sketch = new Sketch({
      view: mapView,
      layer: layer,
    });


    // Listen for sketch complete events
    this.sketch.on("create", (event) => {
      if (event.state === "complete") {
        this.activeGraphic = event.graphic;
      }
    });
  }

  /**
   * Activates the specified drawing tool.
   * @param tool Type of tool to activate (point, line, polygon, circle).
   */
  async activateTool(tool: string): Promise<Geometry | null> {
    this.clearGraphics(); // Clear previous graphics

    let geometryType: "point" | "multipoint" | "polyline" | "polygon" | "circle" | "rectangle" | "ellipse" | null = null;
    switch (tool) {
      case "point":
        geometryType = "point";
        break;
      case "line":
        geometryType = "polyline";
        break;
      case "polygon":
        geometryType = "polygon";
        break;
      case "circle":
        geometryType = "circle"; // Note: May need to approximate circle using polygon geometry
        break;
      default:
        console.error(`Unknown tool type: ${tool}`);
        return null;
    }

    if (this.sketch && geometryType) {
      this.sketch.create(geometryType);
    }

    return new Promise((resolve) => {
      if (this.sketch) {
        this.sketch.on("create", (event) => {
          if (event.state === "complete") {
            resolve(event.graphic.geometry);
          }
        });
      }
    });
  }

  /**
   * Clears graphics from the map.
   */
  clearGraphics() {
    this.mapView.graphics.removeAll();
  }

  /**
   * Queries the layers in the map for features that intersect the provided geometry.
   * @param geometry The geometry to use for querying features.
   * @returns A list of queried layers with their features.
   */
  async queryLayers(geometry: Geometry): Promise<QueriedLayer[]> {
    const results: QueriedLayer[] = [];
    const layers = this.mapView.map.layers.filter((layer) => layer.type === "feature") as __esri.Collection<FeatureLayer>;

    for (const layer of layers.toArray()) {
      const featureLayer = layer as FeatureLayer;

      const query = new Query();
      query.geometry = geometry;
      query.spatialRelationship = "intersects";
      query.returnGeometry = false;
      query.outFields = ["*"];

      const queryResults = await featureLayer.queryFeatures(query);
      const features = queryResults.features.map((feature) => ({
        label: feature.attributes.Name || "Unnamed Feature",
        description: feature.attributes.Description || "No description available",
      }));

      if (features.length > 0) {
        results.push({
          name: featureLayer.title,
          features,
        });
      }
    }

    return results;
  }
}
