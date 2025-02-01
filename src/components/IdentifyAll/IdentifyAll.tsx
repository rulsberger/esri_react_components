import React, { useRef, useEffect, useState } from "react";
import DrawWidget from "../DrawWidgets/DrawWidget";
import FeatureList from "../FeatureList/FeatureList";
import { queryByGeometry } from "../../libs/queryByGeometry"

import { 
  CalciteButton,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem
  } from "@esri/calcite-components-react";


interface FeatureProperties {
    [key: string]: string; // Each feature can have multiple key-value pairs, where key is a string, and value is a string
  }

interface Feature {
    id: number;
    label: string;
    description: string
    properties: FeatureProperties;
  }
  
interface Layer {
    name: string;
    features: Feature[];
}
  
interface FeatureListProps {
    layers: Layer[];
    onClearSelection: () => void;
}

const IdentifyAll: React.FC<{ mapView: __esri.MapView }> = ({ mapView }) => {
  const [activeView, setActiveView] = useState("Identify");
  const [geometry, setGeometry] = useState<__esri.Geometry | null>(null);
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

    setGeometry(geom); // Store the geometry in state
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
                <FeatureList mapView={mapView} data={results}/>
                // <FeatureList layers={layers} onClearSelection={handleClearSelection} />
            )}

        </section>
    </div>
  );
};

export default IdentifyAll;
