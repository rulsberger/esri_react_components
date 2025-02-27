import { useEffect, useState, useRef } from "react";

import Feature from "@arcgis/core/widgets/Feature";

import "@esri/calcite-components/dist/components/calcite-button.js";
import "@esri/calcite-components/dist/components/calcite-icon.js";
import {
  CalciteIcon,
} from "@esri/calcite-components-react";

export enum LoadStatus {
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Rejected = 'Rejected'
}

interface Props {
  mapView: __esri.MapView
  layer: __esri.FeatureLayer
  popupTemplate: __esri.PopupTemplate
  defaultPopupTemplate: __esri.PopupTemplate
  togglable?: boolean
  expandByDefault?: boolean
}

const FeatureInfo: React.FC<Props> = (props) => {
  const { togglable = false, expandByDefault } = props;
  const [showContent, setShowContent] = useState(!togglable || expandByDefault);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.Pending);
  const featureContainerRef = useRef<HTMLDivElement>(null);
  const featureRef = useRef<__esri.Feature | null>(null);

  useEffect(() => {
    createFeature();
    return () => {
      destroyFeature();
    };
  }, [props.popupTemplate, props.defaultPopupTemplate, props.layer]);

  const createFeature = () => {
    const container = document.createElement('div');
    container.className = 'jimu-widget';
    featureContainerRef.current?.appendChild(container);

    const originMap = props.mapView?.map;

    destroyFeature();
    const layer = props.layer as unknown as __esri.Graphic & { spatialReference?: __esri.SpatialReference };
    console.log('FeatureInfo: createFeature', layer);
    if (props.popupTemplate) {
      props.layer.popupTemplate = props.popupTemplate;
    } else if (layer) {
      props.layer.popupTemplate = layer.popupTemplate ?? props.defaultPopupTemplate;
    } else {
      props.layer.popupTemplate = props.defaultPopupTemplate;
    }
    if (layer && !layer.popupTemplate) {
      layer.popupTemplate = props.popupTemplate || props.defaultPopupTemplate;
    }
    featureRef.current = new Feature({
      container: container,
      defaultPopupTemplateEnabled: true,
      spatialReference: layer?.spatialReference || null,
      map: originMap || null,
      graphic: layer,
      visibleElements: getVisibleElements()
    });
    console.log(featureRef);
    setLoadStatus(LoadStatus.Fulfilled);
  };

  const destroyFeature = () => {
    if (featureRef.current && !featureRef.current.destroyed) {
      featureRef.current.destroy();
    }
  };

  const getVisibleElements = () => {
    const expanded = togglable ? showContent : true;
    return {
      title: true,
      content: {
        fields: expanded,
        text: expanded,
        media: expanded,
        attachments: expanded
      },
      lastEditedInfo: false
    };
  };

  const toggleExpanded = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowContent(!showContent);
  };

  return (
    <div className='feature-info-component d-flex align-items-center p-2'>
      {togglable && (
        <button
          aria-label={showContent ? 'Collapse' : 'Expand'}
          className={`p-0 jimu-outline-inside ${showContent ? 'expanded' : ''}`}
          type='button'
          onClick={toggleExpanded}
        >
          {showContent ? <CalciteIcon icon="caret-down"></CalciteIcon> : <CalciteIcon icon="caret-up"></CalciteIcon>}
        </button>
      )}
      <div className='flex-grow-1' ref={featureContainerRef} />
    </div>
  );
};

export default FeatureInfo;
