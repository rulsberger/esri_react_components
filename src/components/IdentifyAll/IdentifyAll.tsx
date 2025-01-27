import React, { useRef,  useState } from "react";
import DrawWidget from "../DrawWidgets/DrawWidget";
import FeatureList from "../FeatureList/FeatureList";
import { GeometryManager } from "../../utils/GeometryManager"

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
  const geometryManagerRef = useRef<GeometryManager | null>(null);

  // Initialize GeometryManager
  if (!geometryManagerRef.current) {
    geometryManagerRef.current = new GeometryManager(mapView);
  }

  const handleToolSelect = async (tool: string) => {
    console.log(`Selected tool: ${tool}`);
    const geometry = await geometryManagerRef.current?.activateTool(tool);
    if (geometry) {
      console.log("Geometry created:", geometry);
      // Perform a query using the geometry
      const queriedLayers = await geometryManagerRef.current?.queryLayers(geometry);
      if (queriedLayers) {
        setLayers(queriedLayers);
      }
    }
  };

  const handleClearSelection = () => {
    console.log("Clear Selection");
    setLayers([]);
    geometryManagerRef.current?.clearGraphics();
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
  ]);

  return (
    <div>
        {/* Segmented Control */}
        <CalciteSegmentedControl>
            <CalciteSegmentedControlItem 
                                value="Identify"
                                checked={activeView === 'Identify'}
                                onClick={() => setActiveView('Identify')}
            >Identify</CalciteSegmentedControlItem>
            <CalciteSegmentedControlItem
                value="Results"
                checked={activeView === 'Results'}
                onClick={() => setActiveView('Results')}
            >
                Results
            </CalciteSegmentedControlItem>
        </CalciteSegmentedControl>
        {/* Main Section */}
        <section>
            {activeView === 'Identify' && (
                <DrawWidget onToolSelect={handleToolSelect} onClearSelection={handleClearSelection} />
            )}
            {activeView === 'Results' && (
                <FeatureList layers={layers} onClearSelection={handleClearSelection} />
            )}
        </section>
    </div>
  );
};

export default IdentifyAll;
