import React, { useEffect, useRef, useState } from "react";
import Draw from "@arcgis/core/views/draw/Draw";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import "@esri/calcite-components/dist/components/calcite-button.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item.js";
import {
  CalciteButton,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
} from "@esri/calcite-components-react";

interface DrawWidgetProps {
  mapView: __esri.MapView;
  onDrawComplete: (geometry: __esri.Geometry) => void;
}

const DrawWidget: React.FC<DrawWidgetProps> = ({
  mapView,
  onDrawComplete,
}) => {
  const drawRef = useRef<__esri.Draw | null>(null);
  const [isDrawReady, setIsDrawReady] = useState(false);
  const [graphicsLayer, setGraphicsLayer] = useState<GraphicsLayer | null>(null);
  const [activeTool, setActiveTool] = useState<"point" | "polyline" | "polygon" | null>(null);


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

  const activateTool = (toolType: "point" | "polyline" | "polygon") => {
    if (!drawRef.current || !isDrawReady || !graphicsLayer) {
      console.error(`Draw tool not ready ${drawRef.current} ${isDrawReady} ${graphicsLayer}`);
      return;
    }

    // Create a draw action
    setActiveTool(toolType); // Update active tool
    const action = drawRef.current.create(toolType, { mode: "click" });

    // Manage vertices and interactive rendering
    action.on("vertex-add", (evt) => updateDrawing(evt.vertices, toolType));
    action.on("cursor-update", (evt) => updateDrawing(evt.vertices, toolType));
    action.on("vertex-remove", (evt) => updateDrawing(evt.vertices, toolType));

    // Finalize geometry on completion
    action.on("draw-complete", (evt) => {
      const geometry = createGeometry(evt.vertices, toolType);
      if (geometry) {
        const graphic = new Graphic({
          geometry,
          symbol: getSymbol(toolType),
        });
        graphicsLayer.add(graphic);
        console.log(geometry)
        // onDrawComplete(geometry);
      }
    });
  };

  const updateDrawing = (vertices: number[][], toolType: "point" | "polyline" | "polygon") => {
    if (!graphicsLayer) return;

    graphicsLayer.removeAll(); // Clear previous graphics

    const geometry = createGeometry(vertices, toolType);
    if (geometry) {
      const graphic = new Graphic({
        geometry,
        symbol: getSymbol(toolType),
      });
      graphicsLayer.add(graphic);
    }
  };

  const createGeometry = (vertices: number[][], toolType: "point" | "polyline" | "polygon") => {
    if (vertices.length === 0) return null;

    switch (toolType) {
      case "point":
        return {
          type: "point", // autocasts as new Point()
          x: vertices[0][0],
          y: vertices[0][1],
          spatialReference: mapView.spatialReference,
        };
      case "polyline":
        return {
          type: "polyline", // autocasts as new Polyline()
          paths: vertices,
          spatialReference: mapView.spatialReference,
        };
      case "polygon":
        return {
          type: "polygon", // autocasts as new Polygon()
          rings: vertices,
          spatialReference: mapView.spatialReference,
        };
      default:
        return null;
    }
  };

  const getSymbol = (toolType: "point" | "polyline" | "polygon"): __esri.Symbol => {
    switch (toolType) {
      case "point":
        return {
          type: "simple-marker",
          color: "red",
          size: "8px",
          outline: {
            color: "white",
            width: 1,
          },
        } as __esri.SimpleMarkerSymbol;
      case "polyline":
        return {
          type: "simple-line",
          color: "blue",
          width: 2,
        } as __esri.SimpleLineSymbol;
      case "polygon":
        return {
          type: "simple-fill",
          color: [0, 0, 255, 0.2],
          outline: {
            color: "blue",
            width: 2,
          },
        } as __esri.SimpleFillSymbol;
      default:
        throw new Error("Unsupported tool type");
    }
  };

  const handleClearSelection = () => {
    if (graphicsLayer) {
      graphicsLayer.removeAll();
      setActiveTool(null);
    }
  };

  return (
    <section className="p-4">
      <p className="text-sm">Use the identify tool to identify features on the map:</p>
      <div className="flex items-center mb-5">
          
          <CalciteSegmentedControl>
            <CalciteSegmentedControlItem
              value="Point"
              iconStart="point"
              onClick={() => activateTool("point")}
              {...(activeTool === "point" ? { checked: true } : {})}
            >
              Point
            </CalciteSegmentedControlItem>
            <CalciteSegmentedControlItem
              value="Line"
              iconStart="line"
              onClick={() => activateTool("polyline")}
              {...(activeTool === "polyline" ? { checked: true } : {})}
            >
              Line
            </CalciteSegmentedControlItem>
            <CalciteSegmentedControlItem
              value="Polygon"
              iconStart="polygon"
              onClick={() => activateTool("polygon")}
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
        <CalciteButton iconStart="reset" onClick={handleClearSelection}>
          Clear Selection
        </CalciteButton>
      </div>
    </section>
  );
};

export default DrawWidget;
