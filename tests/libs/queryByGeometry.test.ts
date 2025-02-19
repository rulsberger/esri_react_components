// import { describe, it, expect, vi } from 'vitest';
// import queryByGeometry, { LayerQueryResults } from '../../src/libs/queryByGeometry';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
// import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
// import { pointGeometry, polylineGeometry, polygonGeometry } from '../fixtures/geometries';

// // Mock the necessary dependencies
// vi.mock('@arcgis/core/layers/FeatureLayer', () => {
//   return {
//     default: vi.fn().mockImplementation(() => ({
//       createQuery: vi.fn().mockReturnValue({
//         geometry: null,
//         returnGeometry: true,
//         outFields: ['*'],
//       }),
//       queryFeatures: vi.fn().mockResolvedValue({
//         features: [
//           {
//             attributes: { OBJECTID: 1 },
//             geometry: { type: 'point' },
//           },
//         ],
//       }),
//     })),
//   };
// });

// vi.mock('@arcgis/core/layers/MapImageLayer', () => {
//   return {
//     default: vi.fn().mockImplementation(() => ({
//       sublayers: [
//         {
//           url: 'https://example.com/layer',
//           visible: true,
//           title: 'Test Layer',
//           popupTemplate: {},
//         },
//       ],
//     })),
//   };
// });

// describe('queryByGeometry', () => {
//   it('should query features by point geometry', async () => {
//     const mapView = {
//       map: {
//         layers: {
//           toArray: () => [
//             new MapImageLayer(),
//           ],
//         },
//       },
//     } as unknown as __esri.MapView;

//     const geometry = pointGeometry;
//     const onlyVisible = true;

//     const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

//     expect(results).toHaveLength(1);
//     expect(results[0].layerName).toBe('Test Layer');
//     expect(results[0].results).toHaveLength(1);
//     expect(results[0].results[0].objectId).toBe(1);
//   });

//   it('should query features by polyline geometry', async () => {
//     const mapView = {
//       map: {
//         layers: {
//           toArray: () => [
//             new MapImageLayer(),
//           ],
//         },
//       },
//     } as unknown as __esri.MapView;

//     const geometry = polylineGeometry;
//     const onlyVisible = true;

//     const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

//     expect(results).toHaveLength(1);
//     expect(results[0].layerName).toBe('Test Layer');
//     expect(results[0].results).toHaveLength(1);
//     expect(results[0].results[0].objectId).toBe(1);
//   });

//   it('should query features by polygon geometry', async () => {
//     const mapView = {
//       map: {
//         layers: {
//           toArray: () => [
//             new MapImageLayer(),
//           ],
//         },
//       },
//     } as unknown as __esri.MapView;

//     const geometry = polygonGeometry;
//     const onlyVisible = true;

//     const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

//     expect(results).toHaveLength(1);
//     expect(results[0].layerName).toBe('Test Layer');
//     expect(results[0].results).toHaveLength(1);
//     expect(results[0].results[0].objectId).toBe(1);
//   });

//   it('should return an empty array if no layers are visible', async () => {
//     const mapView = {
//       map: {
//         layers: {
//           toArray: () => [
//             new MapImageLayer(),
//           ],
//         },
//       },
//     } as unknown as __esri.MapView;

//     const geometry = pointGeometry;
//     const onlyVisible = false;

//     const results: LayerQueryResults[] = await queryByGeometry(mapView, geometry, onlyVisible);

//     expect(results).toHaveLength(0);
//   });
// });