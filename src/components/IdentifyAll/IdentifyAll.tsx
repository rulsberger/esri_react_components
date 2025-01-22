import React, { useState } from "react";
import DrawWidget from "../DrawWidgets/DrawWidget";
import FeatureList from "../FeatureList/FeatureList";

import { 
  CalciteSegmentedControl, 
  CalciteSegmentedControlItem,
  CalciteList,
  CalciteListItem,
  CalciteAction,
  CalciteButton
} from '@esri/calcite-components-react';

// Sample configuration


const IdentifyAll: React.FC = () => {
  const [activeView, setActiveView] = useState('Identify');
  
  const [layers, setLayers] = useState<Layer[]>([
    {
      name: "Waterfalls",
      features: [
        { label: "Niagara Falls", description: "Located on the border between the US and Canada" },
        { label: "Victoria Falls", description: "Located on the border between Zambia and Zimbabwe" },
      ],
    },
    {
      name: "Rivers",
      features: [
        { label: "Amazon River", description: "The largest river by discharge in the world" },
        { label: "Nile River", description: "The longest river in the world" },
      ],
    },
    {
      name: "Estuaries",
      features: [
        { label: "Chesapeake Bay", description: "Located on the east coast of the US" },
        { label: "San Francisco Bay", description: "Located in Northern California" },
      ],
    },
  ]);


  const handleToolSelect = (tool: string) => {
    console.log(`Selected tool: ${tool}`);
    // Handle drawing logic here
  };

  const handleClearSelection = () => {
    console.log("Clear Selection");
    setLayers([]); // Clear the layers
  };

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
