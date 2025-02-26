import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import DrawWidget, { ToolType } from '../../../../src/components/DrawWidget/DrawWidget';
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
});