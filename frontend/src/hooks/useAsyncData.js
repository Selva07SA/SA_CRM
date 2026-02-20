import { useCallback, useEffect, useRef, useState } from 'react';

function useAsyncData(fetcher, deps = []) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const controllerRef = useRef(null);

  const load = useCallback(async (externalSignal = null) => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const isAbortSignal =
      typeof AbortSignal !== 'undefined' && externalSignal instanceof AbortSignal;
    const signal = isAbortSignal ? externalSignal : controller.signal;

    setLoading(true);
    setError('');
    try {
      const result = await fetcher(signal);
      setData(result);
    } catch (err) {
      if (err?.name === 'AbortError') {
        return;
      }
      setError(err.message || 'Failed to load data');
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [load]);

  return { loading, error, data, reload: load };
}

export default useAsyncData;
