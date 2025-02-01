import React, { useRef, useEffect, useState } from "react";
import DrawWidget from "../DrawWidgets/DrawWidget";
import FeatureList from "../FeatureList/FeatureList";
import { queryByGeometry } from "../../libs/queryByGeometry"

import { 
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
    setLayers([]);
  };
  
  // Callback to handle the drawn geometry from DrawWidget
  const handleOnDrawComplete = (geom: __esri.Geometry, onlyVisibleLayers: boolean) => {
    console.log("Geometry received in IdentifyAll:", geom);
    if (onlyVisibleLayers) {
      console.log("Querying visible layers only");
    }

    setGeometry(geom); // Store the geometry in state
    queryByGeometry(mapView, geom, onlyVisibleLayers).then(setResults);
  };

  const [layers, setLayers] = useState<Layer[]>([
    {
      name: "Waterfalls",
      features: [
        { id: 1, label: "Niagara Falls", description: "Located on the border between the US and Canada", properties: {} },
        { id: 2, label: "Victoria Falls", description: "Located on the border between Zambia and Zimbabwe", properties: {}},
      ],
    },
    {
      name: "Rivers",
      features: [
        { id: 1, label: "Amazon River", description: "The largest river by discharge in the world",  properties: {} },
        { id: 2, label: "Nile River", description: "The longest river in the world", properties: {} },
      ],
    },
    {
      name: "Estuaries",
      features: [
        { id: 1, label: "Chesapeake Bay", description: "Located on the east coast of the US",  properties: {} },
        { id: 2, label: "San Francisco Bay", description: "Located in Northern California", properties: {}}
      ],
    },
    {
      name: "Waterfalls",
      features: [
        { id: 1, label: "Niagara Falls", description: "Located on the border between the US and Canada", properties: {} },
        { id: 2, label: "Victoria Falls", description: "Located on the border between Zambia and Zimbabwe", properties: {}},
      ],
    },
    {
      name: "Rivers",
      features: [
        { id: 1, label: "Amazon River", description: "The largest river by discharge in the world",  properties: {} },
        { id: 2, label: "Nile River", description: "The longest river in the world", properties: {} },
      ],
    },
    {
      name: "Estuaries",
      features: [
        { id: 1, label: "Chesapeake Bay", description: "Located on the east coast of the US",  properties: {} },
        { id: 2, label: "San Francisco Bay", description: "Located in Northern California", properties: {}}
      ],
    },
  ]);

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
            {activeView === 'Identify' && (
                <DrawWidget mapView={mapView} onDrawComplete={handleOnDrawComplete}/>
            )}
            {activeView === 'Results' && (
                <FeatureList mapView={mapView} data={results} onClearSelection={handleClearSelection}/>
                // <FeatureList layers={layers} onClearSelection={handleClearSelection} />
            )}
        </section>
    </div>
  );
};

export default IdentifyAll;
