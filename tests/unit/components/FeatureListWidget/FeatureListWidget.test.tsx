import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import FeatureListWidget from '../../../../src/components/FeatureListWidget/FeatureListWidget';
import { LayerQueryResults } from '../../../../src/libs/queryByGeometry';

describe('FeatureListWidget', () => {
  it('renders FeatureListWidget component', () => {
    const data: LayerQueryResults[] = [];
    const mapView = {} as __esri.MapView;

    render(<FeatureListWidget data={data} mapView={mapView} />);

    const element = screen.getByText(/Total Layers:/i);
    expect(element).toBeInTheDocument();
  });
});