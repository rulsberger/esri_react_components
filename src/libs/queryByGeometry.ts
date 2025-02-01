import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

interface QueryResult {
  objectId: number;
  attributes: Record<string, any>;
  geometry?: __esri.Geometry;
}

interface LayerQueryResults {
    layerName: string;
    layer: __esri.FeatureLayer;
    results: QueryResult[];
  }

export async function queryByGeometry(
  mapView: __esri.MapView,
  geometry: __esri.Geometry,
  onlyVisible: boolean
): Promise<LayerQueryResults[]> {
    const resultsByLayer: LayerQueryResults[] = [];

    async function querySublayer(layer: __esri.Sublayer) {
        if (!layer.url || (onlyVisible && !layer.visible)) return;

        try {
            const featureLayer = new FeatureLayer({ url: layer.url });

            const query = featureLayer.createQuery();
            query.geometry = geometry;
            query.returnGeometry = true;
            query.outFields = ["*"];

            const result = await featureLayer.queryFeatures(query);
            if (result.features.length > 0) {
                console.log(`Found ${result.features.length} features in ${layer.title}`);
                resultsByLayer.push({
                layerName: layer.title || "Unnamed Layer",
                layer: featureLayer,
                results: result.features.map(feature => ({
                    objectId: feature.attributes[featureLayer.objectIdField],
                    attributes: feature.attributes,
                    geometry: feature.geometry
                })),
                });
            }
        } catch (error) {
            console.warn(`Error querying ${layer.title}:`, error);
        }
    }

    async function traverseLayers(layer: __esri.Layer) {
        if ("sublayers" in layer && layer.sublayers) {
            for (const sublayer of layer.sublayers.items) {
                await traverseLayers(sublayer);
            }
        } else if ("url" in layer && layer.url) {
        await querySublayer(layer as __esri.Sublayer);
        }
    }

    for (const layer of mapView.map.layers.items) {
        await traverseLayers(layer);
    }

    console.log(resultsByLayer)
    return resultsByLayer;
}
