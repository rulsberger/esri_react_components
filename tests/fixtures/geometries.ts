import Point from '@arcgis/core/geometry/Point';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';

export const pointGeometry = new Point({
  x: -118.805,
  y: 34.027,
  spatialReference: { wkid: 4326 },
});

export const polylineGeometry = new Polyline({
  paths: [
    [
      [-118.821527826096, 34.0139576938577],
      [-118.814893761649, 34.0080602407843],
    ],
  ],
  spatialReference: { wkid: 4326 },
});

export const polygonGeometry = new Polygon({
  rings: [
    [
      [-118.818984489994, 34.0137559967283],
      [-118.806796597377, 34.0215816298725],
      [-118.791432890735, 34.0163883241613],
      [-118.79596686535, 34.008564864635],
      [-118.808558110679, 34.0035027131376],
      [-118.818984489994, 34.0137559967283],
    ],
  ],
  spatialReference: { wkid: 4326 },
});