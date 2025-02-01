import { useEffect, useState } from "react";
import "@esri/calcite-components/dist/components/calcite-label.js";
import "@esri/calcite-components/dist/components/calcite-list.js";
import "@esri/calcite-components/dist/components/calcite-list-item-group.js";
import "@esri/calcite-components/dist/components/calcite-list-item.js";
import "@esri/calcite-components/dist/components/calcite-action.js";
import "@esri/calcite-components/dist/components/calcite-loader.js";
import {
  CalciteLabel,
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
    return polygon.centroid || polygon.extent.center;
  }
  if (geometry.type === "polyline") {
    // Handle midpoint logic for polyline here if required
    return null;
  }
  throw new Error("Unsupported geometry type.");
}

const FeatureList: React.FC<FeatureListProps> = ({ data, mapView }) => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate async fetching completion by watching data
    if (data) {
      setLoading(false);
    }
  }, [data]);

  const totalLayers = data.length;
  const totalFeatures = data.reduce((count, layer) => count + layer.results.length, 0);

  function openPopupAtGeometry(mapView: __esri.MapView, feature: QueryResult) {
    const pointGeom = getBestCenterPoint(feature.geometry);
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
          <CalciteLabel layout="inline-space-between">
            <strong>Total Layers:</strong> {totalLayers}<strong>Total Features:</strong> {totalFeatures}
          </CalciteLabel>
        </div>
      </div>

      {/* Loader when data is being fetched */}
      {loading && <CalciteLoader label="Querying..."></CalciteLoader>}

      {/* Render results or "No Results" message */}
      {!loading && totalFeatures > 0 && (
        <CalciteList filterEnabled>
          {data.map((thisLayer) => (
            <CalciteListItemGroup
              key={`${thisLayer.layerName}`}
              heading={`${thisLayer.layerName}: ${thisLayer.results.length} Features`}
            >
              {thisLayer.results.map((result) => (
                <CalciteListItem
                  key={`${thisLayer.layerName}_${result.objectId}`}
                  label={`Object ID: ${result.objectId}`}
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

      {!loading && totalFeatures === 0 && (
        <div style={{ padding: "16px", color: "#666" }}>
          <strong>No Results Found</strong>
        </div>
      )}
    </section>
  );
};

export default FeatureList;
