import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (endpoint, method = 'GET', body = null, config = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios({
          url: endpoint,
          method,
          data: body,
          ...config
        });
        setData(response.data);
      } catch (err) {
        setError(err.response?.data || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, method, JSON.stringify(body), JSON.stringify(config)]);

  return { data, error, loading };
};

export default useApi;
