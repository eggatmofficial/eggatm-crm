import axiosInstance from "./axiosInstance";

export const apiGet = (url, config) => axiosInstance.get(url, config);
export const apiPost = (url, data) => axiosInstance.post(url, data);
export const apiPut = (url, data) => axiosInstance.put(url, data);
export const apiPatch = (url, data) => axiosInstance.patch(url, data);
export const apiDelete = (url) => axiosInstance.delete(url);

/**
 * Downloads a binary/blob endpoint (used for the Excel export)
 * and saves it to disk client-side, since a plain <a href> link
 * would not carry the Authorization header.
 */
export const apiDownload = async (url, filename) => {
  const res = await axiosInstance.get(url, { responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};
