import React, { useState } from 'react';
// import "@esri/calcite-components/dist/components/calcite-segmented-control.js";
import "@esri/calcite-components/dist/components/calcite-segmented-control-item.js";
import "@esri/calcite-components/dist/components/calcite-list.js";
import "@esri/calcite-components/dist/components/calcite-list-item-group.js";
import "@esri/calcite-components/dist/components/calcite-list-item.js";
import "@esri/calcite-components/dist/components/calcite-action.js";
import "@esri/calcite-components/dist/components/calcite-button.js";
import { 
    CalciteSegmentedControl, 
    CalciteSegmentedControlItem,
    CalciteList,
    CalciteListItemGroup,
    CalciteListItem,
    CalciteAction,
    CalciteButton
} from '@esri/calcite-components-react';


// Sample configuration
const layerConfig = {
    layers: {
      Waterfalls: {
        description: "Vertical drops from a river.",
        value: "waterfalls",
        features: [
          { id: 1, name: "Angel Falls", height: "979m"},
          { id: 2, name: "Niagara Falls", height: "51m" },
        ],
      },
      Rivers: {
        description: "Large naturally flowing watercourses.",
        value: "rivers",
        features: [
          { id: 1, name: "Amazon River", length: "7,062km" },
          { id: 2, name: "Nile River", length: "6,650km" },
        ],
      },
      Estuaries: {
        description: "Where the river meets the sea.",
        value: "estuaries",
        features: [
          { id: 1, name: "Chesapeake Bay", area: "11,601km²" },
          { id: 2, name: "San Francisco Bay", area: "4,160km²" },
        ],
      },
    },
  };


const IdentifyAllComponent: React.FC = () => {
    
    const [activeView, setActiveView] = useState('Identify');

    const [layers, setLayers] = useState(layerConfig.layers);

    const totalLayers = Object.keys(layers).length;
    const totalFeatures = Object.values(layers).reduce(
      (count, layer) => count + layer.features.length,
      0
    );
  
    const clearSelection = () => {
      const clearedLayers = Object.entries(layers).reduce((acc, [key, layer]) => {
        acc[key] = { ...layer, features: [] };
        return acc;
      }, {} as typeof layerConfig["layers"]);
  
      setLayers(clearedLayers);
    };

    return (
        <body>
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
            <main>
                {activeView === 'Identify' && (
                    <section>
                        <div style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                            <div style={{ flex: 1 }}>
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
                        <CalciteButton appearance="outline" iconStart="reset" color="red" onClick={clearSelection}>
                            Clear Selection
                        </CalciteButton>
                        </div>
                        </div>
                    </section>
                )}
                {activeView === 'Results' && (
                    <section>
                        <div style={{ padding: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                                <div style={{ flex: 1 }}>
                                <strong>Total Layers:</strong> {totalLayers} | <strong>Total Features:</strong> {totalFeatures}
                                </div>
                                <CalciteButton appearance="outline" iconStart="reset" color="red" onClick={clearSelection}>
                                Clear Selection
                                </CalciteButton>
                            </div>
                        </div>
                        <CalciteList filter-enabled filter-placeholder="Filter layer.">
                            {Object.entries(layerConfig.layers).map(([layerName, layer]) => (
                            <CalciteListItem
                                key={layer.value}
                                label={layerName}
                                description={layer.description}
                                value={layer.value}
                            >
                                <CalciteList>
                                {layer.features.map((feature) => (
                                    <CalciteListItem
                                        key={feature.id}
                                        label={feature.name}
                                        description={Object.entries(feature)
                                            .filter(([key]) => key !== "id" && key !== "name")
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join("\n ")}
                                        value={String(feature.id)}
                                    >
                                    <CalciteAction
                                        slot="actions-end"
                                        icon="zoom-to-object"
                                        text={`Details about ${feature.name}`}
                                        onClick={() => console.log(`Details about ${feature.name}`)} //ToDo: Add another action to do something in the map here
                                    />
                                    </CalciteListItem>
                                ))}
                                </CalciteList>
                            </CalciteListItem>
                            ))}
                        </CalciteList>
                    </section>
                )}
            </main>
        </body>
    );

};

export default IdentifyAllComponent;
