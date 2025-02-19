import React, { useEffect, useState } from 'react';
import { CalciteLabel, CalciteList, CalciteListItem, CalciteListItemGroup, CalciteAction } from '@esri/calcite-components-react';

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


/**
 * FeatureListWidget component.
 * 
 * @param {FeatureListProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const FeatureListWidget: React.FC<FeatureListProps> = ({ data, mapView }) => {
  const [totalLayers, setTotalLayers] = useState<number>(0);
  const [totalFeatures, setTotalFeatures] = useState<number>(0);
  const [selectedFeature, setSelectedFeature] = useState<__esri.Graphic | null>(null);

  useEffect(() => {
    console.log('FeatureListWidget re-rendered with data:', data);
    if (data && data.length > 0) {
      const totalLayers = data.length;
      setTotalLayers(totalLayers);
      const totalFeatures = data.reduce((count, layer) => count + layer.results.length, 0);
      console.log('total features', totalFeatures);
      setTotalFeatures(totalFeatures);
    } else {
      setTotalLayers(0);
      setTotalFeatures(0);
    }
  }, [data]);

  /**
 * Opens a popup at the selected feature's location.
 * 
 * @param {__esri.MapView} mapView - The map view to use for the popup.
 */
function openPopup(mapView: __esri.MapView) {
  if (!selectedFeature) return;
  // Open popup at feature location
  mapView.openPopup({
    features: [selectedFeature]
  });
}

// /**
//  * Zooms to the selected feature's geometry.
//  * 
//  * @param {__esri.MapView} mapView - The map view to use for zooming.
//  */
// function zoomToGeometry(mapView: __esri.MapView) {
//   if (!selectedFeature) return;

//   mapView.goTo(selectedFeature.geometry.extent.expand(1.5));
// }

/**
 * Selects a feature by its object ID.
 * 
 * @param {__esri.MapView} mapView - The map view to use for the query.
 * @param {__esri.FeatureLayer} layer - The feature layer to query.
 * @param {number} objectId - The object ID of the feature to select.
 */
const selectFeatureByObjectId = async (
  mapView: __esri.MapView,
  layer: __esri.FeatureLayer,
  objectId: number
) => {
  console.log('Selecting feature by object ID:', objectId);
  // TODO: If Popup is already Open, then update the popUp.
  // Reset the Selected Feature
  setSelectedFeature(null)
  try {
    console.log(mapView)
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
      // const layerView = await mapView.whenLayerView(layer);
      // layerView.highlight(feature);

      // TODO: Add a way to clear the highlight, especially if the clear selection button is clicked
        // TODO: Turn on Layer Visibility if it's not visible

      } else {
        console.warn("No feature found with the specified ObjectID.");
    }
  } catch (error) {
    console.error('Error selecting feature by object ID:', error);
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
                  label={`${thisLayer.layerName}: ${result.objectId}`} //TODO: Fix this to show the actual title
                  value={`${thisLayer.layerName} ${result.objectId}`} //TODO: Fix this to show the actual title
                  onCalciteListItemSelect={() => selectFeatureByObjectId(mapView, thisLayer.layer, result.objectId)}
                >
                  <CalciteAction
                    slot="actions-end"
                    icon="information"
                    text={`Information for ${result.objectId}`}
                    onClick={() => openPopup(mapView)}
                  />
                  {/* <CalciteAction
                    slot="actions-end"
                    icon="zoom-to-object"
                    text={`Zoom to ${result.objectId}`}
                    onClick={() => zoomToGeometry(mapView)}
                  /> */}
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
