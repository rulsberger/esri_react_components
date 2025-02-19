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

/**
 * Props for the DrawWidget component.
 */
interface DrawWidgetProps {
  /** The map view to use for the widget. */
  mapView: __esri.MapView;
  /** Callback function to call when drawing is complete. */
  onDrawComplete: (geometry: __esri.Point | __esri.Polygon | __esri.Polyline, onlyVisibleLayers: boolean) => void;
}

/**
 * Enum representing the types of drawing tools.
 */
export enum ToolType {
  Point = "point",
  Polyline = "polyline",
  Polygon = "polygon",
}

/**
 * DrawWidget component.
 * 
 * @param {DrawWidgetProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const DrawWidget: React.FC<DrawWidgetProps> = ({
  mapView,
  onDrawComplete,
}) => {
  const drawRef = useRef<__esri.Draw | null>(null);
  const [spatialReference, setSpatialReference] = useState<__esri.SpatialReference | null>(null);
  const [isDrawReady, setIsDrawReady] = useState(false);
  const [graphicsLayer, setGraphicsLayer] = useState<__esri.Collection<Graphic> | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [onlyVisibleLayers, setOnlyVisibleLayers] = useState(true);

  // Use effect for async initialization
  useEffect(() => {
    const initializeDrawTool = async () => {
      try {
        if (mapView) {
          await mapView.when();
          drawRef.current = new Draw({ view: mapView });
          setSpatialReference(mapView.spatialReference);
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
  }, [mapView]);

  /**
   * Activates the drawing tool.
   * 
   * @param {ToolType} toolType - The type of tool to activate.
   */
  const activateTool = (toolType: ToolType) => {
    if (!drawRef.current || !isDrawReady || !graphicsLayer || !spatialReference) {
      return;
    }

    setActiveTool(toolType);
    const action = drawRef.current.create(toolType, { mode: "click" });

    action.on("vertex-add", (evt) => updateDrawing(evt.vertices, toolType));
    action.on("cursor-update", (evt) => updateDrawing(evt.vertices, toolType));
    action.on("vertex-remove", (evt) => updateDrawing(evt.vertices, toolType));

    action.on("draw-complete", (evt) => {
      const geometry = createGeometry(evt.vertices, toolType);
      if (geometry) {
        const graphic = new Graphic({
          geometry,
          symbol: getSymbol(toolType),
        });
        console.log('Graphic created:', graphic);
        graphicsLayer.add(graphic);
        if (graphic.geometry) {
          switch (geometry.type) {
            case "point":
              onDrawComplete(graphic.geometry as __esri.Point, onlyVisibleLayers);
              break;
            case "polyline":
              onDrawComplete(graphic.geometry as __esri.Polyline, onlyVisibleLayers);
              break;
            case "polygon":
              onDrawComplete(graphic.geometry as __esri.Polygon, onlyVisibleLayers);
              break;
            default:
              return null;
          }
        }
      }
    });
  };

  /**
   * Updates the drawing as vertices are added, removed, or updated.
   * 
   * @param {number[][]} vertices - The vertices of the drawing.
   * @param {ToolType} toolType - The type of tool being used.
   */
  const updateDrawing = (vertices: number[][], toolType: ToolType) => {
    if (!graphicsLayer || !spatialReference) return;

    graphicsLayer.removeAll();

    const geometry = createGeometry(vertices, toolType);
    if (geometry) {
      const graphic = new Graphic({
        geometry,
        symbol: getSymbol(toolType),
      });
      graphicsLayer.add(graphic);
    }
  };

  /**
   * Creates a geometry from the given vertices and tool type.
   * 
   * @param {number[][] | number[][][]} vertices - The vertices of the geometry.
   * @param {ToolType} toolType - The type of tool being used.
   * @returns {__esri.Geometry | null} The created geometry or null if invalid.
   */
  const createGeometry = (vertices: number[][] | number[][][], toolType: ToolType): __esri.Point | __esri.Polyline | __esri.Polygon | null => {
    if (vertices.length === 0 || !spatialReference) return null;

    switch (toolType) {
      case ToolType.Point:
        if (!Array.isArray(vertices[0])) return null;
        const pointCoords = vertices as number[][];
        return new Point({
          x: pointCoords[0][0],
          y: pointCoords[0][1],
          spatialReference: spatialReference,
        });

      case ToolType.Polyline:
        return new Polyline({
          paths: vertices as number[][][],
          spatialReference: spatialReference,
        });

      case ToolType.Polygon:
        return new Polygon({
          rings: vertices as number[][][],
          spatialReference: spatialReference,
        });

      default:
        return null;
    }
  };

  /**
   * Returns the symbol for the given tool type.
   * 
   * @param {ToolType} toolType - The type of tool being used.
   * @returns {__esri.Symbol} The symbol for the tool type.
   */
  const getSymbol = (toolType: ToolType): __esri.Symbol => {
    switch (toolType) {
      case ToolType.Point:
        return new SimpleMarkerSymbol({
          color: "red",
          size: 8,
          outline: {
            color: "white",
            width: 1,
          },
        });
      case ToolType.Polyline:
        return new SimpleLineSymbol({
          color: "blue",
          width: 2,
        });
      case ToolType.Polygon:
        return new SimpleFillSymbol({
          color: [0, 0, 255, 0.1],
          outline: {
            color: "blue",
            width: 2,
          },
        });
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
                onClick={() => activateTool(ToolType.Point)}
                {...(activeTool === "point" ? { checked: true } : {})}
              >
                Point
              </CalciteSegmentedControlItem>
              <CalciteSegmentedControlItem
                value="Line"
                iconStart="line"
                onClick={() => activateTool(ToolType.Polyline)}
                {...(activeTool === "polyline" ? { checked: true } : {})}
              >
                Line
              </CalciteSegmentedControlItem>
              <CalciteSegmentedControlItem
                value="Polygon"
                iconStart="polygon"
                onClick={() => activateTool(ToolType.Polygon)}
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
