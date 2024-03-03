import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

type Awaited<T> = T extends Promise<infer U> ? U : never;

export const useAsync = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  dependencies: any[] = [],
): [Awaited<ReturnType<T>> | undefined, Dispatch<SetStateAction<Awaited<ReturnType<T>> | undefined>>] => {
  const [data, setData] = useState<Awaited<ReturnType<T>>>();

  useEffect(() => {
    if (dependencies.length === 1 && dependencies[0] === undefined) return;

    (async() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const res = await callback();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setData(res);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return res;
    })()
      .then(() => console.log("Data fetched from async loaded"))
      .catch((error) => console.error("Error loading data", error));
  }, dependencies);

  return [data, setData];
};