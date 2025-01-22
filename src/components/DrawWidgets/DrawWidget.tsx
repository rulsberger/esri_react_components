import React from "react";
import {
  CalciteButton,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
} from "@esri/calcite-components-react";

const DrawWidget: React.FC<{ onToolSelect: (tool: string) => void; onClearSelection: () => void }> = ({
  onToolSelect,
  onClearSelection,
}) => {
  return (
    <section>
        <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
                <p>Use the identify tool to identify features on the map:  </p>
                <CalciteSegmentedControl>
                    <CalciteSegmentedControlItem value="point" iconStart='point' onClick={() => onToolSelect("point")}>
                    Point
                    </CalciteSegmentedControlItem>
                    <CalciteSegmentedControlItem value="line" iconStart='line' onClick={() => onToolSelect("line")}>
                    Line
                    </CalciteSegmentedControlItem>
                    <CalciteSegmentedControlItem value="polygon" iconStart='polygon' onClick={() => onToolSelect("polygon")}>
                    Polygon
                    </CalciteSegmentedControlItem>
                    <CalciteSegmentedControlItem value="circle" iconStart='circle' onClick={() => onToolSelect("circle")}>
                    Circle
                    </CalciteSegmentedControlItem>
                </CalciteSegmentedControl>
            </div>
            <CalciteButton appearance="outline" iconStart="reset" color="red" onClick={onClearSelection}>
                Clear Selection
            </CalciteButton>
        </div>
        </div>
    </section>
  );
};

export default DrawWidget;
