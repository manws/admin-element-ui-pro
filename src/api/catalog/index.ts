import { isMockEnabled } from "@/mock";
import { mockCatalogPage, mockCatalogRemove, mockCatalogSave } from "@/mock/catalog";
import request from "@/utils/request";

const BASE_URL = "/api/v1/catalog";

const CatalogAPI = {
  page(key: string, params: Record<string, any>) {
    if (isMockEnabled) return Promise.resolve(mockCatalogPage(key, params));
    return request({ url: `${BASE_URL}/${key}`, method: "get", params });
  },
  save(key: string, data: Record<string, any>) {
    if (isMockEnabled) return Promise.resolve(mockCatalogSave(key, data));
    return request({ url: `${BASE_URL}/${key}`, method: "post", data });
  },
  remove(key: string, ids: string) {
    if (isMockEnabled) return Promise.resolve(mockCatalogRemove(key, ids));
    return request({ url: `${BASE_URL}/${key}/${ids}`, method: "delete" });
  },
};

export default CatalogAPI;
