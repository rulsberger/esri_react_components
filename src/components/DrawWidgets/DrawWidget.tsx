import React, { useEffect, useRef } from "react";
import Draw from "@arcgis/core/views/draw/Draw";
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
  onClearSelection: () => void;
}

const DrawWidget: React.FC<DrawWidgetProps> = ({
  mapView,
  onDrawComplete,
  onClearSelection,
}) => {
  const drawRef = useRef<__esri.Draw | null>(null);

  useEffect(() => {
    if (!mapView || !mapView.ready) return;
    
    drawRef.current = new Draw({ view: mapView });
    return () => {
      console.log(drawRef.c)
      drawRef.current
      // if (drawRef.current) {
      //   drawRef.current.destroy();
      //   drawRef.current = null;
      // }
    };
  
  }, [mapView]);

  const activateTool = (tool: __esri.Geometry) => {
    console.log(tool)
    if (!drawRef.current) return;

    const action = drawRef.current.create("polyline", {mode: "click"});
    action.on("draw-complete", (event) => {
      const geometry = event.geometry;
      if (geometry) {
        onDrawComplete(geometry); // Pass geometry back to parent
      }
    });
    action.on("cursor-update", function (evt) {
      console.log("move")
    });
  };
  

  return (
<section className="p-4">
  <div className="flex items-center mb-4">
    <div className="flex-1">
      <p className="text-lg">Use the identify tool to identify features on the map:</p>
      <CalciteSegmentedControl>
        <CalciteSegmentedControlItem
          value="Point"
          iconStart="point"
          onClick={() => activateTool("point")}
        >
          Point
        </CalciteSegmentedControlItem>
        <CalciteSegmentedControlItem
          value="Line"
          iconStart="line"
          onClick={() => activateTool("line")}
        >
          Line
        </CalciteSegmentedControlItem>
        <CalciteSegmentedControlItem
          value="Polygon"
          iconStart="polygon"
          onClick={() => activateTool("polygon")}
        >
          Polygon
        </CalciteSegmentedControlItem>
        <CalciteSegmentedControlItem
          value="Circle"
          iconStart="circle"
          onClick={() => activateTool("circle")}
        >
          Circle
        </CalciteSegmentedControlItem>
      </CalciteSegmentedControl>
    </div>
    <CalciteButton
      iconStart="reset"
      onClick={onClearSelection}
    >
      Clear Selection
    </CalciteButton>
  </div>
</section>

  );
};

export default DrawWidget;
