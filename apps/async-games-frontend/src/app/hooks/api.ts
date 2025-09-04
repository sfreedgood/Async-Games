import { useState, useEffect, useMemo } from 'react';
import axios, { HttpStatusCode as HttpStatus } from 'axios';
import {
  HttpStatusCode,
  HttpStatusMessage,
  RequestURLOptions,
  Response,
  buildUrl,
} from '../../api';

interface GetDataState<T> extends Response<T> {
  loading: boolean;
  error: Error | null;
}

export const useAxiosGet = <T>(
  endpoint: string,
  options?: RequestURLOptions<T>
): GetDataState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<HttpStatusCode | number>(
    HttpStatus.InternalServerError
  );
  const [statusText, setStatusText] = useState<HttpStatusMessage | string>(
    'InternalServerError'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const url = useMemo(() => buildUrl(endpoint, options), [endpoint, options]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(url);
        setStatus(response.status);
        setStatusText(response.statusText);
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [url]);

  return {
    data,
    status,
    statusText,
    loading,
    error,
  };
};
