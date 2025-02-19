import QueryService from '../../../src/libs/QueryService';
import { describe, test, expect, vi, beforeEach } from "vitest";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Query from "@arcgis/core/tasks/support/Query";

describe("QueryService", () => {
  let mockQueryFeatures: ReturnType<typeof vi.fn>;
  let mockFeatureLayerInstance: FeatureLayer;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a real FeatureLayer instance
    mockFeatureLayerInstance = new FeatureLayer({ url: "https://example.com/layer/1" });

    // Add a popupTemplate attribute to the mock
    mockFeatureLayerInstance.popupTemplate = { } as __esri.PopupTemplate;

    // Create a mock Query instance
    const mockQueryInstance = {
      geometry: {} as __esri.Geometry,
      returnGeometry: true,
      outFields: ["*"],
      where: "",
      spatialRelationship: "intersects",
      orderByFields: [],
      groupByFieldsForStatistics: [],
      outStatistics: [],
      returnZ: false,
      returnM: false,
      returnDistinctValues: false,
      num: 1000,
      start: 0,
      maxAllowableOffset: null,
      geometryPrecision: null,
      outSpatialReference: null,
      gdbVersion: null,
      distance: 0,
      units: null,
      relationParameter: null,
      timeExtent: null,
      returnCountOnly: false,
      returnIdsOnly: false,
      returnExtentOnly: false,
      returnCentroid: false,
      multipatchOption: null,
      quantizationParameters: null,
      sqlFormat: "none",
      resultOffset: null,
      resultRecordCount: null,
      historicMoment: null,
      returnTrueCurves: false,
      sqlExpression: null,
      parameterValues: null,
      rangeValues: null,
    } as unknown as Query;
    
    // Spy on the `createQuery` method so it returns our mock query object
    vi.spyOn(mockFeatureLayerInstance, "createQuery").mockImplementation(() => mockQueryInstance);

    // Spy on `queryFeatures` to return mock data
    mockQueryFeatures = vi.fn();
    vi.spyOn(mockFeatureLayerInstance, "queryFeatures").mockImplementation(mockQueryFeatures);
  });


  test("returns null when there are no query results", async () => {
    mockQueryFeatures.mockResolvedValueOnce({ features: [] });

    const result = await QueryService.queryFeatureLayer(mockFeatureLayerInstance.url, {} as __esri.Geometry);

    expect(result).toBeNull();
  });

  test("handles query errors gracefully", async () => {
    mockQueryFeatures.mockRejectedValueOnce(new Error("Query failed"));

    const result = await QueryService.queryFeatureLayer(mockFeatureLayerInstance.url, {} as __esri.Geometry);

    expect(result).toBeNull();
  });
});