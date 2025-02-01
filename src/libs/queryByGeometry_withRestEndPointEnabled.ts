import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

interface QueryResult {
  objectId: number;
  attributes: Record<string, any>;
}

interface LayerQueryResults {
  layerName: string;
  results: QueryResult[];
}

export async function queryByGeometry(
  mapView: __esri.MapView,
  geometry: __esri.Geometry,
  onlyVisible: boolean
): Promise<LayerQueryResults[]> {
    console.log('Querying by geometry')
    const resultsByLayer: LayerQueryResults[] = [];

    // Recursive function to handle sublayers
    async function queryLayerRecursively(layer: __esri.Sublayer | __esri.Layer) {
    if ("sublayers" in layer && layer.sublayers) {
        for (const sublayer of layer.sublayers.items) {
        await queryLayerRecursively(sublayer);
        }
    } else if (layer.type === "feature" && (!onlyVisible || layer.visible)) {
        const featureLayer = layer as __esri.FeatureLayer;
        const query = featureLayer.createQuery();
        query.geometry = geometry;
        query.returnGeometry = false;
        query.outFields = ["*"];

        try {
        const result = await featureLayer.queryFeatures(query);

        if (result.features.length > 0) {
            console.log(`Found ${result.features.length} features in ${featureLayer.title}`);
            resultsByLayer.push({
            layerName: featureLayer.title,
            results: result.features.map(feature => ({
                objectId: feature.attributes[featureLayer.objectIdField],
                attributes: feature.attributes,
            })),
            });
        }
        } catch (error) {
        console.warn(`Error querying ${featureLayer.title}:`, error);
        }
    }
    }

    // Traverse layers in the map
    const layers = mapView.map.layers;
    for (const layer of layers.items) {
        console.log(layer)
        await queryLayerRecursively(layer);
    }

  return resultsByLayer;
}
