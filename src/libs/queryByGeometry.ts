import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";

export interface QueryResult {
  objectId: number;
  attributes: Record<string, any>;
  geometry?: __esri.Geometry;
}

export interface LayerQueryResults {
    layerName: string;
    layer: __esri.FeatureLayer;
    results: QueryResult[];
}

export default async function queryByGeometry(
  mapView: __esri.MapView,
  geometry: __esri.Geometry,
  onlyVisible: boolean
): Promise<LayerQueryResults[]> {
    const resultsByLayer: LayerQueryResults[] = [];

    async function querySublayer(layer: __esri.Sublayer) {
        // TODO: Research the SubLayer QueryTask
        if (!layer.url || (onlyVisible && !layer.visible)) return;

        try {
            // Creating a new FeatureLayer from the URL
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
                    popupTemplate: layer.popupTemplate,
                    attributes: feature.attributes,
                    geometry: feature.geometry
                })),
                });
            }
        } catch (error) {
            console.warn(`Error querying ${layer.title}:`, error);
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
        console.log(layer)
        // TODO: Handle All LayerTypes 
        if (layer instanceof MapImageLayer) {
            await traverseLayers(layer);
        }
    }

    return resultsByLayer;
}

