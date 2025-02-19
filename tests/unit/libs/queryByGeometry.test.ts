import { describe, it, expect, vi } from 'vitest';
import queryByGeometry, { LayerQueryResults } from '../../../src/libs/queryByGeometry';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';

// Mock the necessary dependencies
vi.mock('@arcgis/core/layers/FeatureLayer', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      createQuery: vi.fn().mockReturnValue({
        geometry: null,
        returnGeometry: true,
        outFields: ['*'],
      }),
      queryFeatures: vi.fn().mockResolvedValue({
        features: [
          {
            attributes: { OBJECTID: 1 },
            geometry: { type: 'point' },
          },
        ],
      }),
    })),
  };
});

vi.mock('@arcgis/core/layers/MapImageLayer', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      sublayers: [
        {
          url: 'https://example.com/layer',
          visible: true,
          title: 'Test Layer',
          popupTemplate: {},
        },
      ],
    })),
  };
});

describe('queryByGeometry', () => {
  it('should query features by geometry', async () => {
    const mapView = {
      map: {
        layers: {
          toArray: () => [
            new MapImageLayer(),
          ],
        },
      },
    } as unknown as __esri.MapView;

    const geometry = { type: 'point' } as __esri.Geometry;
    const onlyVisible = true;

    const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

    expect(results).toHaveLength(1);
    expect(results[0].layerName).toBe('Test Layer');
    expect(results[0].results).toHaveLength(1);
    expect(results[0].results[0].objectId).toBe(1);
  });
});