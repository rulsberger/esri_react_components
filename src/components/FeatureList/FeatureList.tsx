import { useEffect, useState } from "react";
import {
  CalciteButton,
  CalciteList,
  CalciteListItem,
  CalciteListItemGroup,
  CalciteAction,
  CalciteLoader
} from "@esri/calcite-components-react";

import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon.js";

interface QueryResult {
  objectId: number;
  geometry?: __esri.Geometry;
  attributes: Record<string, any>;
}

interface LayerQueryResults {
  layerName: string;
  layer: __esri.FeatureLayer;
  results: QueryResult[];
}

interface FeatureListProps {
data: LayerQueryResults[];
mapView: __esri.MapView;
onClearSelection: () => void;
}

function getBestCenterPoint(geometry: __esri.Geometry) {
  if (geometry.type === "point") {
    return geometry;
  }

  if (geometry.type === "polygon") {
    const polygon = new Polygon(geometry);
    // Use the centroid property directly if available
    if (polygon.centroid) {
      return polygon.centroid;
    }
    console.warn("Centroid property not available, consider fallback.");
    return polygon.extent.center; // Backup using extent center
  }

  if (geometry.type === "polyline") {
    // ToDo: Get the MidPoint of a polyLine
    return null
  }

  throw new Error("Unsupported geometry type.");
}

const FeatureList: React.FC<FeatureListProps> = ({ data, mapView, onClearSelection }) => {
  // Add a loading state to track the fetching process
  const [loading, setLoading] = useState<boolean>(true);

  const totalLayers = data.length;
  const totalFeatures = data.reduce((count, layer) => count + layer.results.length, 0);

  // Simulate async data loading (for example, after a query is executed)
  useEffect(() => {
    // Assuming data is fetched asynchronously, set loading to false once it's complete
    if (data.length > 0) {
      setLoading(false);
    }
  }, [data]);

  function openPopupAtGeometry(mapView: __esri.MapView, feature: QueryResult) {
    const pointGeom = getBestCenterPoint(feature.geometry);
    console.log("Popup Location:", pointGeom);
  
    if (pointGeom) {
      mapView.openPopup({
        title: "Feature Details",
        content: `<pre>${JSON.stringify(feature.attributes, null, 2)}</pre>`,
        location: pointGeom
      });
    } else {
      console.warn("No valid geometry for popup");
    }
  }
  

  function zoomToGeometry(mapView: __esri.MapView, feature: QueryResult) {  
      mapView.goTo({ target: feature.geometry, zoom: 10 });
  }

  return (
    <section>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <strong>Total Layers:</strong> {totalLayers} | <strong>Total Features:</strong> {totalFeatures}
          </div>
          <CalciteButton appearance="outline" iconStart="reset" color="red" onClick={onClearSelection}>
            Clear Selection
          </CalciteButton>
        </div>
      </div>
      {loading === true && (
          <CalciteLoader label="Querying..."></CalciteLoader>
      )}
      {loading === false && (
           <CalciteList 
           filterEnabled
         >
           {data.map((thisLayer) => (
             <CalciteListItemGroup
               key={`${thisLayer.layerName}`}
               heading={`${thisLayer.layerName}:  ${thisLayer.results.length} Features`}
             >
               {thisLayer.results.map((result) => (
                 <CalciteListItem
                   key={`${thisLayer.layerName}_${result.objectId}`}
                   label={`Object ID: ${result.objectId}`}
                   value={thisLayer.layer}
                   closable
                 >
                    <CalciteAction
                     slot="actions-start"
                     icon="information"
                     text={`Information for ${result.objectId}`}
                     onClick={() => openPopupAtGeometry(mapView, result)}
                   />
                   <CalciteAction
                     slot="actions-end"
                     icon="zoom-to-object"
                     text={`Zoom to ${result.objectId}`}
                     onClick={() => zoomToGeometry(mapView, result)}
                   />
                 </CalciteListItem>
               ))}
             </CalciteListItemGroup>
           ))}
         </CalciteList>
      )}
     
    </section>
  );
};

export default FeatureList;
