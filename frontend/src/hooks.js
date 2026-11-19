import { useCallback, useEffect, useState } from 'react';
import { analysisApi, resumeApi } from './api';

/** Loads a single resume, refreshing whenever the id changes. */
export function useResume(id) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setError('');
      setResume(await resumeApi.get(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { resume, loading, error, reload };
}

/** Loads the most recent stored analysis report for a resume. */
export function useReport(id) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setError('');
      const result = await analysisApi.latest(id);
      setReport(result || null);
    } catch (err) {
      // 404 simply means this resume has no stored run yet.
      if (err.status === 404) {
        setReport(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { report, loading, error, reload, setReport };
}