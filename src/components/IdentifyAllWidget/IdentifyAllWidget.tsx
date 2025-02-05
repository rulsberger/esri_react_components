import React, { useEffect, useState } from "react";
import DrawWidget from "../DrawWidget/DrawWidget";
import FeatureListWidget from "../FeatureListWidget/FeatureListWidget";
import queryByGeometry, {LayerQueryResults} from "../../libs/queryByGeometry"
  
import "@esri/calcite-components/dist/components/calcite-button.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item.js";
import { 
  CalciteButton,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem
  } from "@esri/calcite-components-react";


const IdentifyAllWidget: React.FC<{ mapView: __esri.MapView }> = ({ mapView }) => {
  const [activeView, setActiveView] = useState("Identify");
  const [results, setResults] = useState<LayerQueryResults[]>([])

  // Track mapView readiness and initialize GeometryManager
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

    return () => {
    };
  
  }, [mapView]);

  const handleClearSelection = () => {
    console.log("Clear Selection");
    setResults([]);
    mapView.graphics.removeAll();
  };
  
  // Callback to handle the drawn geometry from DrawWidget
  const handleOnDrawComplete = (geom: __esri.Geometry, onlyVisibleLayers: boolean) => {
    setResults([]);
    console.log("Geometry received in IdentifyAll:", geom);
    if (onlyVisibleLayers) {
      console.log("Querying visible layers only");
    }

    queryByGeometry(mapView, geom, onlyVisibleLayers).then(setResults);
    setActiveView('Results')
  };

  return (
    <div>
        {/* Segmented Control */}
        <CalciteSegmentedControl>
            <CalciteSegmentedControlItem 
                value="Identify"
                {...(activeView === "Identify" ? { checked: true } : {})}
                onClick={() => setActiveView('Identify')}
            >Identify</CalciteSegmentedControlItem>
            <CalciteSegmentedControlItem
                value="Results"
                {...(activeView === "Results" ? { checked: true } : {})}
                onClick={() => setActiveView('Results')}
            >
                Results
            </CalciteSegmentedControlItem>
        </CalciteSegmentedControl>
        {/* Main Section */}
        <section>
            <CalciteButton iconStart="reset" onClick={handleClearSelection}>
              Clear Selection
            </CalciteButton>
            {activeView === 'Identify' && (
                <DrawWidget mapView={mapView} onDrawComplete={handleOnDrawComplete}/>
            )}
            {activeView === 'Results' && (
                <FeatureListWidget mapView={mapView} data={results}/>
            )}

        </section>
    </div>
  );
};

export default IdentifyAllWidget;
