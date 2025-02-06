import  { useRef, useEffect, useState } from "react";

import "@esri/calcite-components/dist/components/calcite-shell.js";
import "@esri/calcite-components/dist/components/calcite-shell-panel.js";
import "@esri/calcite-components/dist/components/calcite-panel.js";
import {
    CalciteShell,
    CalciteShellPanel,
    CalcitePanel,
  } from "@esri/calcite-components-react";

import IdentifyAllWidget from "./components/IdentifyAllWidget/IdentifyAllWidget";


export default function App() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [mapView, setMapView] = useState<__esri.MapView | null>(null); // State to store MapView

  useEffect(() => {
    let cleanupFn: () => void; // To store the cleanup function
  
    (async () => {
      try {
        const mapping = await import("./libs/mapping");
        const view = await mapping.init(mapDiv.current!); // Initialize the MapView
        setMapView(view); // Store the MapView in state
        window.mapView = view; 
        cleanupFn = mapping.cleanup; // Save the cleanup function for later
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    })();
  
    return () => {
      if (cleanupFn) cleanupFn(); // Destroy the MapView when the component unmounts
    };
  }, []);
  return (
    <div className="h-full w-full">
      <CalciteShell id="mainCalciteShell">
        <CalciteShellPanel           
            slot="panel-start"
            position="start"
            id="left-shell-panel">
            <CalcitePanel heading="Identify All">
            {mapView ? (
              <IdentifyAllWidget mapView={mapView} />
            ) : (
              <p>Loading map...</p>  // Fallback UI while the map initializes
            )}
            </CalcitePanel>
        </CalciteShellPanel>
        <div className="h-full w-full" ref={mapDiv}></div>
      </CalciteShell>
    </div>
  );
}