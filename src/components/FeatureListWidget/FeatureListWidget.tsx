import { useEffect, useState } from "react";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
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
  CalciteAction,
  CalciteIcon
} from "@esri/calcite-components-react";

import { QueryResult, LayerQueryResults } from "../../libs/QueryService";

interface FeatureListQueryResult extends QueryResult {
  graphic?: __esri.Graphic;
}

export interface FeatureListLayerQueryResults {
  results: FeatureListQueryResult[];
}

interface FeatureListProps {
  data: LayerQueryResults[];
  mapView: __esri.MapView;
}

export enum CalciteListItemAction {
  Select = "Select"
}

interface GraphicState {
  original: {
    symbol: __esri.Symbol;
    visible: boolean;
  };
  updated: {
    symbol: __esri.Symbol;
    visible: boolean;
  };
}

const FeatureListWidget: React.FC<FeatureListProps> = ({ data, mapView }) => {
  const [totalLayers, setTotalLayers] = useState<number>(0);
  const [totalFeatures, setTotalFeatures] = useState<number>(0);
  const [selectedFeature, setSelectedFeature] = useState<__esri.Graphic | null>(null);
  const [graphicState, setGraphicState] = useState<Record<string, GraphicState>>({});

  useEffect(() => {
    if (data && data.length > 0) {
      const totalLayers = data.length;
      setTotalLayers(totalLayers);
      const totalFeatures = data.reduce((count, layer) => count + layer.results.length, 0);
      setTotalFeatures(totalFeatures);

      displayResultsOnMapView(mapView, data);
    } else {
      setTotalLayers(0);
      setTotalFeatures(0);
    }
  }, [data]);

  const displayResultsOnMapView = (mapView: __esri.MapView, data: LayerQueryResults[]) => {
    let graphicsLayer = mapView.map.findLayerById("sketchGraphicsLayer") as __esri.GraphicsLayer;
    if (!graphicsLayer) {
      graphicsLayer = new GraphicsLayer({ id: "sketchGraphicsLayer" });
      mapView.map.add(graphicsLayer);
    }

    graphicsLayer.removeAll();

    const pointSymbol = createPointSymbol();
    const polylineSymbol = createPolylineSymbol();
    const polygonSymbol = createPolygonSymbol();

    data.forEach(layer => {
      layer.results.forEach(result => {
        if (result.geometry) {
          const symbol = getSymbolForGeometry(result.geometry.type, pointSymbol, polylineSymbol, polygonSymbol);
          if (!symbol) return;

          const graphic = createGraphic(result.geometry, symbol, result.attributes, layer.featureLayer.visible, layer.featureLayer.popupTemplate);
          graphicsLayer.add(graphic);

          (result as FeatureListQueryResult).graphic = graphic as __esri.Graphic;

          const uniqueId = `${layer.layerName}_${result.objectId}`;
          setGraphicState(prevState => ({
            ...prevState,
            [uniqueId]: {
              original: {
                symbol: symbol,
                visible: graphic.visible
              },
              updated: {
                symbol: symbol,
                visible: graphic.visible
              }
            }
          }));
        }
      });
    });
  };

  const createPointSymbol = () => ({
    type: "simple-marker",
    style: "circle",
    color: [20, 130, 200, 0.5],
    size: "8px",
    outline: {
      color: "white",
      width: 0.5
    }
  });

  const createPolylineSymbol = () => ({
    type: "simple-line",
    color: [20, 130, 200, 0.5],
    width: 2
  });

  const createPolygonSymbol = () => ({
    type: "simple-fill",
    color: [20, 130, 200, 0.5],
    outline: {
      color: "white",
      width: 0.5
    }
  });

  const getSymbolForGeometry = (geometryType: string, pointSymbol: __esri.Symbol, polylineSymbol: __esri.Symbol, polygonSymbol: __esri.Symbol) => {
    switch (geometryType) {
      case "point":
        return pointSymbol;
      case "polyline":
        return polylineSymbol;
      case "polygon":
        return polygonSymbol;
      default:
        console.error("Unsupported geometry type:", geometryType);
        return null;
    }
  };

  const createGraphic = (geometry: __esri.Geometry, symbol: __esri.Symbol, attributes: any, visible: boolean, popupTemplate: __esri.PopupTemplate) => new Graphic({
    geometry,
    symbol,
    attributes,
    visible,
    popupTemplate
  });

  const openPopup = (mapView: __esri.MapView) => {
    if (!selectedFeature) return;
    mapView.openPopup({
      features: [selectedFeature],
    });
  };

  const selectFeatureByObjectId = async (mapView: __esri.MapView, layer: __esri.FeatureLayer, objectId: number, graphic: __esri.Graphic) => {
    try {
      const yellowSymbol = new SimpleFillSymbol({
        color: [255, 255, 0, 0.5],
        outline: {
          color: [255, 255, 0, 1],
          width: 2
        }
      });

      let graphicsLayer = mapView.map.findLayerById("sketchGraphicsLayer") as __esri.GraphicsLayer;

      const uniqueId = `${layer.title}_${objectId}`;

      if (graphic) {
        // Reset symbols of previously selected features
        Object.keys(graphicState).forEach(id => {
          if (id !== uniqueId && graphicState[id].original.symbol !== graphicState[id].updated.symbol) {
            console.log("Resetting symbol for", id);
            const graphicToReset = graphicsLayer.graphics.find(g => `${layer.title}_${g.attributes.OBJECTID}` === id);
            console.log("Graphic to reset:", graphicToReset);
            if (graphicToReset) {
              console.log("Resetting symbol for", id);
              graphicToReset.symbol = graphicState[id].original.symbol;
              setGraphicState(prevState => ({
                ...prevState,
                [id]: {
                  ...prevState[id],
                  updated: {
                    ...prevState[id].updated,
                    symbol: prevState[id].original.symbol
                  }
                }
              }));
            }
          }
        });

        // Update the symbol of the selected feature
        graphic.symbol = yellowSymbol;

        setGraphicState(prevState => ({
          ...prevState,
          [uniqueId]: {
            ...prevState[uniqueId],
            updated: {
              ...prevState[uniqueId].updated,
              symbol: yellowSymbol
            }
          }
        }));

        // Use a callback to update the selected feature state
        setSelectedFeature(() => {
          return graphic;
        });
      }
    } catch (error) {
      console.error("Error selecting feature:", error);
    }
  };

  const handleSelectAndAction = async (action: CalciteListItemAction, mapView: __esri.MapView, layer: __esri.FeatureLayer, objectId: number, graphic: __esri.Graphic) => {
    await selectFeatureByObjectId(mapView, layer, objectId, graphic);
    if (action === CalciteListItemAction.Select) {
      openPopup(mapView);
    }
  };

  const toggleGraphicVisibility = (objectId: number, layerName: string) => {
    const uniqueId = `${layerName}_${objectId}`;
    data.forEach(layer => {
      if (layer.layerName === layerName) {
        const result = layer.results.find(r => r.objectId === objectId);
        if (result && result.graphic) {
          const newVisibility = !result.graphic.visible;
          result.graphic.visible = newVisibility;

          setGraphicState(prevState => ({
            ...prevState,
            [uniqueId]: {
              ...prevState[uniqueId],
              updated: {
                ...prevState[uniqueId].updated,
                visible: newVisibility
              }
            }
          }));
        }
      }
    });
  };

  const getPopupTitle = (layer: __esri.FeatureLayer, result: FeatureListQueryResult): string => {
    const popupTemplate = layer.popupTemplate || layer.defaultPopupTemplate as PopupTemplate;
    if (popupTemplate && popupTemplate.title) {
      return popupTemplate.title.replace(/{([^}]+)}/g, (_, fieldName) => {
        return result.attributes[fieldName] || "";
      });
    }
    return "No Title";
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

      {totalFeatures > 0 ? (
        <CalciteList filterEnabled>
          {data.map((thisLayer) => (
            <CalciteListItemGroup
              key={`${thisLayer.layerName}`}
              heading={`${thisLayer.layerName}: ${thisLayer.results.length} Features`}
            >
              {thisLayer.results.map((result: FeatureListQueryResult) => (
                <CalciteListItem
                  key={`${thisLayer.layerName}_${result.objectId}`}
                  label={getPopupTitle(thisLayer.featureLayer, result)}
                  value={`${thisLayer.layerName} ${getPopupTitle(thisLayer.featureLayer, result)}`}
                  onCalciteListItemSelect={() => handleSelectAndAction(CalciteListItemAction.Select, mapView, thisLayer.featureLayer, result.objectId, result.graphic as __esri.Graphic)}
                >
                  <CalciteIcon icon="information" scale="s" slot="content-start"></CalciteIcon>
                  <CalciteAction
                  slot="actions-end"
                  icon={graphicState[`${thisLayer.layerName}_${result.objectId}`]?.updated.visible ? "view-visible" : "view-hide"}
                  text={`Toggle visibility for ${result.objectId}`}
                  onClick={() => toggleGraphicVisibility(result.objectId, thisLayer.layerName)}
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
