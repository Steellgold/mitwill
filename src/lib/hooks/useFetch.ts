import { useEffect, useMemo, useReducer, useRef } from "react";
import DeviceInfo from "react-native-device-info";

interface State<T> {
  data?: T;
  error?: Error;
}

type Cache<T> = Record<string, { data: T; timestamp: number }>

type Action<T> =
  | { type: "loading" }
  | { type: "fetched"; payload: T }
  | { type: "error"; payload: Error }

interface FetchOptions<T> extends RequestInit {
  onFetchRequest?: () => void;
  onFetchedRequest?: (data: T) => void;
  onRefetchedRequest?: (data: T) => void;
}

export function useFetch<T = unknown>(
  url?: string,
  options?: FetchOptions<T>,
  revalidateAfter?: number
): State<T> {
  const cache = useRef<Cache<T>>({});

  const cancelRequest = useRef<boolean>(false);

  const initialState: State<T> = {
    error: undefined,
    data: undefined
  };

  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case "loading":
        return { ...initialState };
      case "fetched":
        return { ...initialState, data: action.payload };
      case "error":
        return { ...initialState, error: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(fetchReducer, initialState);
  const serializedOptions = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    if (!url) return;

    cancelRequest.current = false;

    const fetchData = async(): Promise<void> => {
      options?.onFetchRequest?.();
      dispatch({ type: "loading" });

      const currentCache = cache.current[url];

      if (currentCache && (Date.now() - currentCache.timestamp) < (revalidateAfter || 0) * 1000) {
        dispatch({ type: "fetched", payload: currentCache.data });
        const timeUntilRevalidate = revalidateAfter - ((Date.now() - currentCache.timestamp) / 1000);
        options.onRefetchedRequest?.(currentCache.data);
        setTimeout(() => {
          console.log(`Revalidating the request (${url}) in ${revalidateAfter} seconds.`);
        }, timeUntilRevalidate * 1000);
        return;
      }


      try {
        const deviceId = await DeviceInfo.getUniqueId();
        const response = await fetch(url.replace("{deviceId}", deviceId), options);
        if (!response.ok) throw new Error(response.statusText);

        const data = (await response.json()) as T;
        cache.current[url] = { data, timestamp: Date.now() };
        if (cancelRequest.current) return;

        dispatch({ type: "fetched", payload: data });

        if (revalidateAfter) {
          console.log(`Revalidating the request (${url}) in ${revalidateAfter} seconds.`);
          setTimeout(() => fetchData(), revalidateAfter * 1000);
        }

        if (currentCache) options.onRefetchedRequest?.(data);
        else options.onFetchedRequest?.(data);

      } catch (error) {
        if (cancelRequest.current) return;
        dispatch({ type: "error", payload: error as Error });
      }
    };

    void fetchData();

    return () => {
      cancelRequest.current = true;
    };
  }, [url, serializedOptions, revalidateAfter]);

  return state;
}