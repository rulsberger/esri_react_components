import React, { useEffect, useState } from "react";
import DrawWidget from "../DrawWidget/DrawWidget";
import FeatureListWidget from "../FeatureListWidget/FeatureListWidget";
import queryByGeometry, { LayerQueryResults } from "../../libs/queryByGeometry";

import "@esri/calcite-components/dist/components/calcite-button.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item.js";
import "@esri/calcite-components/dist/components/calcite-loader.js";
import {
  CalciteButton,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteLoader
} from "@esri/calcite-components-react";

/**
 * Enum representing the ready state of the widget.
 */
export enum ReadyState {
  Idle = "Idle",
  Loading = "Loading",
  Success = "Success",
  Error = "Error",
}

/**
 * Enum representing the active view of the widget.
 */
export enum ActiveView {
  Identify = "Identify",
  Results = "Results"
}

/**
 * Props for the IdentifyAllWidget component.
 */
interface IdentifyAllWidgetProps {
  /** The map view to use for the widget. */
  mapView: __esri.MapView;
}

/**
 * IdentifyAllWidget component.
 * 
 * @param {IdentifyAllWidgetProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
const IdentifyAllWidget: React.FC<IdentifyAllWidgetProps> = ({ mapView }) => {
  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.Idle);
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Identify);
  const [queryGeometry, setQueryGeometry] = useState<__esri.Geometry | null>(null);
  const [onlyVisibleLayers, setOnlyVisibleLayers] = useState<boolean>(true);
  const [results, setResults] = useState<LayerQueryResults[]>([]);

  // Track mapView readiness
  useEffect(() => {
    const initializeIdentifyAll = async () => {
      try {
        if (mapView) {
          await mapView.when();
        }
      } catch (error) {
        console.error('Error initializing identifyAll Tool:', error);
      }
    };

    initializeIdentifyAll();
  }, [mapView]);

  useEffect(() => {
    const runQuery = async () => {
      if (!queryGeometry) return;
  
      setReadyState(ReadyState.Loading);
      try {
        const results = await queryByGeometry(mapView, queryGeometry, onlyVisibleLayers);
        setResults(results);
        setReadyState(ReadyState.Success);
      } catch (error) {
        console.error("Error querying features:", error);
        setReadyState(ReadyState.Error);
      }
    };
    runQuery();
  }, [queryGeometry, onlyVisibleLayers]); 

  const handleClearSelection = () => {
    setResults([]);
    mapView.graphics.removeAll();
  };
  
  // Callback to handle the drawn geometry from DrawWidget
  const handleOnDrawComplete = (geom: __esri.Geometry, onlyVisibleLayers: boolean) => {
    // Clear the Results
    setResults([]);
    setQueryGeometry(geom)
    setOnlyVisibleLayers(onlyVisibleLayers);
  };

  // TODO: if there is a drawing and the user clicks the visible layers toggle, we should run the query again

  return (
    <div>
        {/* Segmented Control */}
        <CalciteSegmentedControl>
            <CalciteSegmentedControlItem 
                value="Identify"
                {...(activeView === "Identify" ? { checked: true } : {})}
                onClick={() => setActiveView(ActiveView.Identify)}
            >Identify</CalciteSegmentedControlItem>
            <CalciteSegmentedControlItem
                value="Results"
                {...(activeView === "Results" ? { checked: true } : {})}
                onClick={() => setActiveView(ActiveView.Results)}
            >
                Results
            </CalciteSegmentedControlItem>
        </CalciteSegmentedControl>
        {/* Main Section */}
        <section>
            <CalciteButton iconStart="reset" onClick={handleClearSelection}>
              Clear Selection
            </CalciteButton>
            {activeView === ActiveView.Identify && (
                <DrawWidget mapView={mapView} onDrawComplete={handleOnDrawComplete}/>
            )}
            {activeView === ActiveView.Results && 
              (readyState === ReadyState.Success ? (
                <FeatureListWidget data={results} mapView={mapView}/>
              ) : readyState === ReadyState.Loading ? (
                <CalciteLoader label='Querying by Draw Geometry...' type="indeterminate" />
              ) : readyState === ReadyState.Error ? (
                <p>Error loading features.</p>
              ) : (
                <FeatureListWidget data={results} mapView={mapView}/>
              ))
            }

        </section>
    </div>
  );
};

export default IdentifyAllWidget;
