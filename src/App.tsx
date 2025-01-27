import  { useRef, useEffect, useState } from "react";

import "@esri/calcite-components/dist/components/calcite-shell.js";
import "@esri/calcite-components/dist/components/calcite-shell-panel.js";
import "@esri/calcite-components/dist/components/calcite-panel.js";
import {
    CalciteShell,
    CalciteShellPanel,
    CalcitePanel,
  } from "@esri/calcite-components-react";

import IdentifyAll from "./components/IdentifyAll/IdentifyAll";


export default function App() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [mapView, setMapView] = useState<__esri.MapView | null>(null); // State to store MapView

  useEffect(() => {
    if (mapDiv.current) {
      import("./libs/mapping").then((mapping) => {
        const view = mapping.init(mapDiv.current!);
        setMapView(view);
      });

    }
  }, [mapDiv]);

  return (
    <div className="h-full w-full">
      <CalciteShell id="mainCalciteShell">
        <CalciteShellPanel           
            slot="panel-start"
            position="start"
            id="left-shell-panel"
            widthScale="2">
            <CalcitePanel heading="Identify All">
            {<IdentifyAll mapView={mapView} />}
            </CalcitePanel>
        </CalciteShellPanel>
        <div className="h-full w-full" ref={mapDiv}></div>
      </CalciteShell>
    </div>
  );
}