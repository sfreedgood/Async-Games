import { URLSearchOptions, basePath } from '.';

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
