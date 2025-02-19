import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import DrawWidget, { ToolType } from '../../../src/components/DrawWidget/DrawWidget';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';

// Mock the necessary dependencies
vi.mock('@arcgis/core/Graphic', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  };
});

vi.mock('@arcgis/core/geometry/Point', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  };
});

vi.mock('@arcgis/core/geometry/Polyline', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  };
});

vi.mock('@arcgis/core/geometry/Polygon', () => {
  return {
    default: vi.fn().mockImplementation(() => ({})),
  };
});

describe('DrawWidget', () => {
  it('renders DrawWidget component', () => {
    render(<DrawWidget mapView={null} onDrawComplete={() => {}} />);
    const element = screen.getByText(/Drawing Tool:/i);
    expect(element).toBeInTheDocument();
  });

  // it('activates the drawing tool when a tool is selected', async () => {
  //   const mapView = {
  //     when: vi.fn().mockResolvedValue(true),
  //     spatialReference: {},
  //     graphics: {
  //       add: vi.fn(),
  //       removeAll: vi.fn(),
  //     },
  //   } as unknown as __esri.MapView;

  //   await act(async () => {
  //     render(<DrawWidget mapView={mapView} onDrawComplete={() => {}} />);
  //   });

  //   const pointToolButton = screen.getByText(/Point/i);

  //   console.log('pointToolButton', pointToolButton);
  //   await act(async () => {
  //     fireEvent.click(pointToolButton);
  //   });

  //   expect(mapView.graphics.add).toHaveBeenCalled();
  // });

  // it('calls onDrawComplete when drawing is complete', async () => {
  //   const mapView = {
  //     when: vi.fn().mockResolvedValue(true),
  //     spatialReference: {},
  //     graphics: {
  //       add: vi.fn(),
  //       removeAll: vi.fn(),
  //     },
  //   } as unknown as __esri.MapView;

  //   const onDrawComplete = vi.fn();

  //   await act(async () => {
  //     render(<DrawWidget mapView={mapView} onDrawComplete={onDrawComplete} />);
  //   });

  //   // Simulate drawing complete event
  //   const drawInstance = {
  //     create: vi.fn().mockReturnValue({
  //       on: (event, callback) => {
  //         if (event === 'draw-complete') {
  //           callback({ vertices: [[0, 0]] });
  //         }
  //       },
  //     }),
  //   };

  //   await act(async () => {
  //     fireEvent.click(screen.getByText(/Point/i));
  //   });

  //   expect(onDrawComplete).toHaveBeenCalled();
  // });
});