import React from "react";
import "@esri/calcite-components/dist/components/calcite-button.js";
import "@esri/calcite-components/dist/components/calcite-list.js";
import "@esri/calcite-components/dist/components/calcite-list-item-group.js";
import "@esri/calcite-components/dist/components/calcite-list-item.js";
import "@esri/calcite-components/dist/components/calcite-action.js";
import {
    CalciteButton,  
    CalciteList,
    CalciteListItem,
    CalciteListItemGroup,
    CalciteAction,
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
    id: number;
    name: string;
    description: string;
    features: Feature[];
}
  
interface FeatureListProps {
    layers: Layer[];
    onClearSelection: () => void;
}

const FeatureList: React.FC<FeatureListProps> = ({ layers, onClearSelection }) => {
    // Calculate the total number of layers and features
    const totalLayers = layers.length;
    const totalFeatures = layers.reduce(
        (count, layer) => count + layer.features.length,
        0
    );

    return (
        <section>
            <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                    <strong>Total Layers:</strong> {totalLayers} | <strong>Total Features:</strong> {totalFeatures}
                    </div>
                    <CalciteButton appearance="outline" iconStart="reset" color="red" onClick={onClearSelection}>
                    Clear Selection
                    </CalciteButton>
                </div>
            </div>
            <CalciteList filterEnabled>
                {layers.map((layer) => (
                <CalciteListItemGroup
                    key = {layer.name}
                    heading={layer.name}
                >
                    <CalciteList>
                    {layer.features.map((feature) => (
                        <CalciteListItem
                            key={String(layer.name) + '_' + String(feature.id)}
                            label={feature.label}
                            description={Object.entries(feature)
                                .filter(([key]) => key !== "id" && key !== "name")
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")} //ToDo: Render the items in a list rather than tabbed here
                            value={String(feature.label)}  
                            closable
                            // ToDo: On hover/click, highlight this feature
                        >
                            {/* TODO Evaluate Content-Bottom slot for adding the Key Value Pairs for Feature Properties*/}
                            <CalciteAction
                                slot="actions-end"
                                icon="zoom-to-object"
                                text={`Zoom to ${feature.id}`}
                                onClick={() => console.log(`Zoom to ${feature.id}`)} //ToDo: Add another action to do something in the map here
                            />
                        </CalciteListItem>
                    ))}
                    </CalciteList>
                </CalciteListItemGroup>
                ))}
            </CalciteList>
        </section>
    );
};

export default FeatureList;
