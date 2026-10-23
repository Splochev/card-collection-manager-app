import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

/**
 * HTTP Client interface for abstracting HTTP operations.
 * This enables easier testing by allowing mock implementations.
 */
export interface IHttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }>;
  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }>;
  put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<{ data: T }>;
}

/**
 * Axios-based HTTP client implementation.
 * Authentication is handled by the backend via an httpOnly cookie,
 * so requests only need to include credentials.
 */
export class AxiosHttpClient implements IHttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL?: string) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
    });
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<{ data: T }> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

/**
 * Creates a new HTTP client instance.
 */
export const createHttpClient = (baseURL?: string): IHttpClient => {
  return new AxiosHttpClient(baseURL);
};

export default createHttpClient;
