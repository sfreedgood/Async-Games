import { HttpStatus } from '@nestjs/common';
import { ParseInt } from '../app/utils/type-utils';
import axios from 'axios';

const baseURL = 'http://localhost';
const PORT = 3000;

export type HttpStatusMessage = keyof typeof HttpStatus;
export type HttpStatusCode = ParseInt<`${HttpStatus}`>;

export type URLSearchOptions<T> = {
  [Property in keyof T]: string;
};

export type RequestURLOptions<T> = {
  searchParams: URLSearchOptions<T>;
};

export type Response<T> = {
  data: T | null;
  status: number | HttpStatusCode;
  statusText: string | HttpStatusMessage;
};

export const basePath = `${baseURL}:${PORT}/api`;
export function buildUrl<T>(
  endpoint: string,
  options?: { searchParams: URLSearchOptions<T> }
) {
  const url = new URL(`${basePath}${endpoint}`);
  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach((entry) => {
      const [k, searchParam] = entry as [
        keyof URLSearchOptions<T>,
        URLSearchOptions<T>[keyof URLSearchOptions<T>]
      ];
      url.searchParams.append(k as string, searchParam);
    });
  }

  return url.toString();
}

export const getData = async <T>(
  endpoint: string,
  options?: RequestURLOptions<T>
) => {
  const url = buildUrl(endpoint, options);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
