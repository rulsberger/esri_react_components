import { useEffect, useState } from "react";
import "@esri/calcite-components/dist/components/calcite-label.js";
import "@esri/calcite-components/dist/components/calcite-list.js";
import "@esri/calcite-components/dist/components/calcite-list-item-group.js";
import "@esri/calcite-components/dist/components/calcite-list-item.js";
import "@esri/calcite-components/dist/components/calcite-action.js";
import {
  CalciteLabel,
  CalciteList,
  CalciteListItem,
  CalciteListItemGroup,
  CalciteAction
} from "@esri/calcite-components-react";

interface QueryResult {
  objectId: number;
  geometry?: __esri.Geometry;
  attributes: Record<string, any>;
}

export interface LayerQueryResults {
    layerName: string;
    layer: __esri.FeatureLayer;
    results: QueryResult[];
}

interface FeatureListProps {
  data: LayerQueryResults[];
  mapView: __esri.MapView;
}

const FeatureListWidget: React.FC<FeatureListProps> = ({ data, mapView }) => {
  const [totalLayers, setTotalLayers] = useState<number>(0);
  const [totalFeatures, setTotalFeatures] = useState<number>(0);
  const [selectedFeature, setSelectedFeature] = useState<__esri.Graphic | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const totalLayers = data.length;
      setTotalLayers(totalLayers);
      const totalFeatures = data.reduce((count, layer) => count + layer.results.length, 0); 
      setTotalFeatures(totalFeatures);
    } else {
      setTotalLayers(0);
      setTotalFeatures(0);
    }
  }, [data]);

  function openPopupAtGeometry(mapView: __esri.MapView) {
    if (!selectedFeature) return;
      // Open popup at feature location
      mapView.openPopup({
        features: [selectedFeature],
        location: selectedFeature.geometry,
      });
  }

  function zoomToGeometry(mapView: __esri.MapView, ) {
    if (!selectedFeature) return;

    mapView.goTo(selectedFeature.geometry.extent.expand(1.5));
  }

  const selectFeatureByObjectId = async (
    mapView: __esri.MapView,
    layer: __esri.FeatureLayer,
    objectId: number
  ) => {
    try {
      // Define query
      const query = layer.createQuery();
      query.objectIds = [objectId];
      query.outFields = ["*"]; // Specify the fields you want; use ["*"] for all
      query.returnGeometry = true;
  
      // Execute query
      const result = await layer.queryFeatures(query);
  
      if (result.features.length > 0) {
        const feature = result.features[0];
        setSelectedFeature(feature);
  
        // Highlight the feature
        // TODO: Fix the highlighting, it's not working
        const layerView = await mapView.whenLayerView(layer);
        const highlightHandle = layerView.highlight(feature);

        // TODO: Add a way to clear the highlight, especially if the clear selection button is clicked
        // TODO: Turn on Layer Visibility if it's not visible

      } else {
        console.warn("No feature found with the specified ObjectID.");
      }
    } catch (error) {
      console.error("Error selecting feature:", error);
    }
  };
  
  return (
    <section>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <CalciteLabel layout="inline-space-between">
            <strong>Total Layers:</strong> {totalLayers}<strong>Total Features:</strong> {totalFeatures}
          </CalciteLabel>
        </div>
      </div>


      {/* Render results or "No Results" message */}
      {totalFeatures > 0 ? (
        <CalciteList filterEnabled>
          {data.map((thisLayer) => (
            <CalciteListItemGroup
              key={`${thisLayer.layerName}`}
              heading={`${thisLayer.layerName}: ${thisLayer.results.length} Features`}
            >
              {thisLayer.results.map((result) => (
                <CalciteListItem
                  key={`${thisLayer.layerName}_${result.objectId}`}
                  label={`${thisLayer.layer.popupTemplate.title}`} //TODO: Fix this to show the actual title
                  value={`${thisLayer.layer.popupTemplate.title}`} //TODO: Fix this to show the actual title
                  onClick={() => selectFeatureByObjectId(mapView, thisLayer.layer, result.objectId)}
                >
                  <CalciteAction
                    slot="actions-start"
                    icon="information"
                    text={`Information for ${result.objectId}`}
                    onClick={() => openPopupAtGeometry(mapView)}
                  />
                  <CalciteAction
                    slot="actions-end"
                    icon="zoom-to-object"
                    text={`Zoom to ${result.objectId}`}
                    onClick={() => zoomToGeometry(mapView)}
                  />
                </CalciteListItem>
              ))}
            </CalciteListItemGroup>
          ))}
        </CalciteList>
      ) : (
        <div style={{ padding: "16px", color: "#666" }}>
          <strong>No Results Found</strong>
        </div>
      )}
    </section>
  );
};

export default FeatureListWidget;
