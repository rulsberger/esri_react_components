import React, { useEffect, useRef, useState } from "react";
import Draw from "@arcgis/core/views/draw/Draw";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

import "@esri/calcite-components/dist/components/calcite-label.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item.js";
import "@esri/calcite-components/dist/components/calcite-checkbox.js";
import {
  CalciteLabel,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteCheckbox
} from "@esri/calcite-components-react";


interface DrawWidgetProps {
  mapView: __esri.MapView;
  onDrawComplete: (geometry: __esri.Point | __esri.Polygon | __esri.Polyline,  onlyVisibleLayers: boolean) => void;
}

const DrawWidget: React.FC<DrawWidgetProps> = ({
  mapView,
  onDrawComplete,
}) => {
  const drawRef = useRef<__esri.Draw | null>(null);
  const [isDrawReady, setIsDrawReady] = useState(false);
  const [graphicsLayer, setGraphicsLayer] = useState< __esri.Collection<Graphic> | null>(null);
  const [activeTool, setActiveTool] = useState<"point" | "polyline" | "polygon" | null>(null);
  const [onlyVisibleLayers, setOnlyVisibleLayers] = useState(true);

  // Use effect for async initialization
  useEffect(() => {
    const initializeDrawTool = async () => {
      try {
        if (mapView) { 
          await mapView.when();
          drawRef.current = new Draw({ view: mapView });
          setGraphicsLayer(mapView.graphics);
          setIsDrawReady(true);
        }
      } catch (error) {
        console.error('Error initializing draw tool:', error);
      }
    };

    initializeDrawTool();

    return () => {
      if (drawRef.current) {
        drawRef.current.destroy();
      }
    };
  }, [mapView]); // Watch for changes to mapView

  mapView.ready



  const activateTool = (toolType: "point" | "polyline" | "polygon", spatialReference: __esri.SpatialReference) => {
    if (!drawRef.current || !isDrawReady || !graphicsLayer) {
      return;
    }

    // Create a draw action
    setActiveTool(toolType); // Update active tool
    const action = drawRef.current.create(toolType, { mode: "click" });

    // Manage vertices and interactive rendering
    action.on("vertex-add", (evt) => updateDrawing(evt.vertices, toolType, spatialReference));
    action.on("cursor-update", (evt) => updateDrawing(evt.vertices, toolType, spatialReference));
    action.on("vertex-remove", (evt) => updateDrawing(evt.vertices, toolType, spatialReference));

    // Finalize geometry on completion
    action.on("draw-complete", (evt) => {
      const geometry = createGeometry(evt.vertices, toolType, spatialReference);
      if (geometry) {
        const graphic = new Graphic({
          geometry,
          symbol: getSymbol(toolType),
        });
        graphicsLayer.add(graphic);
        onDrawComplete(geometry, onlyVisibleLayers);
      }
    });
  };

  const updateDrawing = (vertices: number[][], toolType: "point" | "polyline" | "polygon", spatialReference: __esri.SpatialReference) => {
    if (!graphicsLayer) return;

    graphicsLayer.removeAll(); // Clear previous graphics

    const geometry = createGeometry(vertices, toolType, spatialReference);
    if (geometry) {
      const graphic = new Graphic({
        geometry,
        symbol: getSymbol(toolType),
      });
      graphicsLayer.add(graphic);
    }
  };

  const createGeometry = (vertices: number[][] | number[][][], toolType: "point" | "polyline" | "polygon", spatialReference: __esri.SpatialReference) => {
    if (vertices.length === 0) return null;

    switch (toolType) {
      case "point":
        if (!Array.isArray(vertices[0])) return null;
        const pointCoords = vertices as number[][];
        return new Point({
          x: pointCoords[0][0],
          y: pointCoords[0][1],
          spatialReference,
        });
  
      case "polyline":
        return new Polyline({
          paths: vertices as number[][][],
          spatialReference,
        });
  
      case "polygon":
        return new Polygon({
          rings: vertices as number[][][],
          spatialReference,
        });
  
      default:
        return null;
    }
  };


  
  const getSymbol = (toolType: "point" | "polyline" | "polygon"): __esri.Symbol => {
    switch (toolType) {
      case "point":
        return new SimpleMarkerSymbol({
          color: "red",
          size: 8,
          outline: {
            color: "white",
            width: 1,
          },
        });
  
      case "polyline":
        return new SimpleLineSymbol({
          color: "blue",
          width: 2,
        });
  
      case "polygon":
        return new SimpleFillSymbol({
          color: [0, 0, 255, 0.2],
          outline: {
            color: "blue",
            width: 2,
          },
        });
  
      default:
        throw new Error("Unsupported tool type");
    }
  };
  

  const handleCheckboxChange = (event: any) => {
    setOnlyVisibleLayers(event.target.checked);
  };

  return (
    <section className="p-4">
      <div>
          <CalciteLabel layout="inline-space-between">
            Drawing Tool:
            <CalciteSegmentedControl>
              <CalciteSegmentedControlItem
                value="Point"
                iconStart="point"
                onClick={() => activateTool("point", mapView.spatialReference)}
                {...(activeTool === "point" ? { checked: true } : {})}
              >
                Point
              </CalciteSegmentedControlItem>
              <CalciteSegmentedControlItem
                value="Line"
                iconStart="line"
                onClick={() => activateTool("polyline", mapView.spatialReference)}
                {...(activeTool === "polyline" ? { checked: true } : {})}
              >
                Line
              </CalciteSegmentedControlItem>
              <CalciteSegmentedControlItem
                value="Polygon"
                iconStart="polygon"
                onClick={() => activateTool("polygon", mapView.spatialReference)}
                {...(activeTool === "polygon" ? { checked: true } : {})}
              >
                Polygon
              </CalciteSegmentedControlItem>
              {/* <CalciteSegmentedControlItem
                value="Circle"
                iconStart="circle"
                onClick={() => activateTool("circle")}
                {...(activeTool === "circle" ? { checked: true } : {})}
              >
                Circle
              </CalciteSegmentedControlItem> */}
            </CalciteSegmentedControl>
          </CalciteLabel>
        </div>
        <div>
          {/* TODO Make Sure that this checkbox is visible */}
          <CalciteLabel>
            Query Only Visible Layers:
            <CalciteCheckbox 
                      checked={onlyVisibleLayers}
                      onCalciteCheckboxChange={handleCheckboxChange}
            ></CalciteCheckbox>
          </CalciteLabel>
        </div>                                                               



    </section>
  );
};

export default DrawWidget;
