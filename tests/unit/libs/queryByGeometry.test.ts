import { describe, it, expect, vi, beforeEach } from 'vitest';
import queryByGeometry, { LayerQueryResults } from '../../../src/libs/queryByGeometry';
import QueryService from '../../../src/libs/QueryService';
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
      allSublayers: {
        toArray: vi.fn().mockReturnValue([
          {
            url: 'https://example.com/layer',
            visible: true,
            title: 'Test Layer',
            popupTemplate: {},
          },
        ]),
      },
    })),
  };
});

vi.mock('../../../src/libs/QueryService', () => {
  return {
    queryFeatureLayer: vi.fn().mockResolvedValue({
      layerName: 'Test Layer',
      results: [
        {
          objectId: 1,
          attributes: { OBJECTID: 1 },
          geometry: { type: 'point' },
        },
      ],
    }),
  };
});

describe('queryByGeometry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

//   it('should query features by geometry', async () => {
//     const mapView = {
//       map: {
//         layers: {
//           toArray: () => [
//             new MapImageLayer(),
//           ],
//         },
//       },
//     } as unknown as __esri.MapView;

//     const geometry = { type: 'point' } as __esri.Geometry;
//     const onlyVisible = true;

//     const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

//     expect(results).toHaveLength(1);
//     expect(results[0].layerName).toBe('Test Layer');
//     expect(results[0].results).toHaveLength(1);
//     expect(results[0].results[0].objectId).toBe(1);
//   });

  it('should return an empty array if no layers are visible', async () => {
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
    const onlyVisible = false;

    const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

    expect(results).toHaveLength(0);
  });
});