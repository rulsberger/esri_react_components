import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import queryByGeometry, { LayerQueryResults } from '../../../src/libs/queryByGeometry';

describe('queryByGeometry (integration)', () => {
  beforeAll(() => {
    // Setup code, e.g., initialize environment variables
  });

  afterAll(() => {
    // Teardown code, e.g., clean up resources
  });

  it('should query features by geometry from actual service', async () => {
    const mapView = {
      map: {
        layers: {
          toArray: () => [
            {
              url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/0',
              visible: true,
              title: 'Census Layer',
              popupTemplate: {},
              createQuery: () => ({
                geometry: null,
                returnGeometry: true,
                outFields: ['*'],
              }),
              queryFeatures: async (query) => {
                const response = await fetch(
                  `${query.url}/query?where=1=1&outFields=*&returnGeometry=true&f=json`
                );
                const data = await response.json();
                return {
                  features: data.features.map((feature) => ({
                    attributes: feature.attributes,
                    geometry: feature.geometry,
                  })),
                };
              },
            },
          ],
        },
      },
    } as unknown as __esri.MapView;

    const geometry = { type: 'point', x: -118.15, y: 34.13 } as __esri.Geometry;
    const onlyVisible = true;

    const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

    expect(results).toHaveLength(1);
    expect(results[0].layerName).toBe('Census Layer');
    expect(results[0].results).toHaveLengthGreaterThan(0);
  });
});