import React, { useEffect, useRef, useImperativeHandle, useState } from 'react';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import '@esri/calcite-components/dist/components/calcite-button.js';
import {
  CalciteLabel,
  CalciteAction
} from "@esri/calcite-components-react";

import './SketchWidget.css';

interface SketchWidgetProps {
  view: MapView;
  onDrawComplete?: (event: __esri.SketchViewModelCreateEvent) => void;
}

const SketchWidget = React.forwardRef<unknown, SketchWidgetProps>(({ view, onDrawComplete }, ref) => {
  const sketchViewModelRef = useRef<SketchViewModel | null>(null);
  const graphicsLayerRef = useRef<GraphicsLayer | null>(null);
  const [geometry, setGeometry] = useState<__esri.Geometry | null>(null);

  useImperativeHandle(ref, () => ({
    get geometry() {
      return geometry;
    }
  }));

  useEffect(() => {
    if (!view) return;

    // Create a new GraphicsLayer and add it to the map
    const graphicsLayer = new GraphicsLayer();
    view.map.add(graphicsLayer);
    graphicsLayerRef.current = graphicsLayer;

    // Create a new SketchViewModel
    const sketchViewModel = new SketchViewModel({
      view: view,
      layer: graphicsLayer,
    });
    sketchViewModelRef.current = sketchViewModel;

    // Add event listener for the create event
    sketchViewModel.on('create', (event) => {
      if (event.state === 'complete') {
        setGeometry(event.graphic.geometry);
        if (onDrawComplete) {
          onDrawComplete(event);
        }
      }
    });

    // Clean up on component unmount
    return () => {
      view.map.remove(graphicsLayer);
      sketchViewModel.destroy();
    };
  }, [view, onDrawComplete]);

  const handleCreatePoint = () => {
    sketchViewModelRef.current?.create('point');
  };

  const handleCreatePolyline = () => {
    sketchViewModelRef.current?.create('polyline');
  };

  const handleCreatePolygon = () => {
    sketchViewModelRef.current?.create('polygon');
  };

  const handleCreateRectangle = () => {
    sketchViewModelRef.current?.create('rectangle');
  };

  const handleCreateCircle = () => {
    sketchViewModelRef.current?.create('circle');
  };

  const handleClearGraphics = () => {
    graphicsLayerRef.current?.removeAll();
    setGeometry(null);
  };

  return (
    <div>
      <div className="sketch-widget">
          <div className="menu-container">
            <CalciteLabel layout="inline-space-between" for="drawingTool">
              Drawing Tool:
              <div className="tools-container" id='drawingTool'>
                <CalciteAction icon="pin" text="Draw a point" title="Draw a point" scale="s" slot="control" id="pointBtn" onClick={handleCreatePoint}></CalciteAction>
                <CalciteAction icon="line" text="Draw a polyline" title="Draw a polyline" scale="s" slot="control" id="polylineBtn" onClick={handleCreatePolyline}></CalciteAction>
                <CalciteAction icon="polygon" text="Draw a polygon" title="Draw a polygon" scale="s" slot="control" id="polygonBtn" onClick={handleCreatePolygon}></CalciteAction>
                <CalciteAction icon="rectangle" text="Draw a rectangle" title="Draw a rectangle" scale="s" slot="control" id="rectangleBtn" onClick={handleCreateRectangle}></CalciteAction>
                <CalciteAction icon="circle" text="Draw a circle" title="Draw a circle" scale="s" slot="control" id="circleBtn" onClick={handleCreateCircle}></CalciteAction>
              </div>
              <div className="actions-container">
                <CalciteAction icon="trash" text="Clear graphics" title="Clear graphics" scale="s" slot="control" id="clearBtn" onClick={handleClearGraphics}></CalciteAction>
              </div>
            </CalciteLabel>
          </div>
      </div>
    </div>
  );
});

export default SketchWidget;