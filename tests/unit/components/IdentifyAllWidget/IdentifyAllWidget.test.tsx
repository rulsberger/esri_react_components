import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import IdentifyAllWidget from '../../../../src/components/IdentifyAllWidget/IdentifyAllWidget';

// Mock the necessary dependencies
vi.mock('@arcgis/core/views/MapView', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      when: vi.fn().mockResolvedValue(true),
    })),
  };
});

vi.mock('@arcgis/core/layers/FeatureLayer', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  };
});

// Mock child components
vi.mock('../../../../src/components/DrawWidget/DrawWidget', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked DrawWidget</div>,
  };
});

vi.mock('../../../../src/components/FeatureListWidget/FeatureListWidget', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked FeatureListWidget</div>,
  };
});

// Mock Calcite Components
vi.mock('@esri/calcite-components-react', () => {
  return {
    CalciteButton: ({ children }) => <button>{children}</button>,
    CalciteSegmentedControl: ({ children }) => <div>{children}</div>,
    CalciteSegmentedControlItem: ({ children }) => <div>{children}</div>,
    CalciteLoader: () => <div>Loading...</div>,
    CalciteLabel: ({ children }) => <label>{children}</label>,
  };
});

describe('IdentifyAllWidget', () => {
  it('renders IdentifyAllWidget component', () => {
    const mapView = {
      when: vi.fn().mockResolvedValue(true),
    } as unknown as __esri.MapView;

    render(<IdentifyAllWidget mapView={mapView} />);

    const element = screen.getByText(/Identify/i);
    expect(element).toBeInTheDocument();
  });
});