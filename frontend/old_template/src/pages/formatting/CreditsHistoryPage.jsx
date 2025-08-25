import React, { useEffect, useState } from 'react';
import useApi from "@/hooks/useApi";


const CreditsHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const { data, error, loading } = useApi('/api/credits/history');

  useEffect(() => {
    if (data) setHistory(data);
  }, [data]);
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Credits Usage History</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error loading history.</p>}

      <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="text-left p-2 border">Date</th>
            <th className="text-left p-2 border">Action</th>
            <th className="text-left p-2 border">Credits Used</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">No history available.</td>
            </tr>
          ) : (
            history.map((entry, index) => (
              <tr key={index} className="border-t">
                <td className="p-2 border">{formatDateTime(entry.timestamp)}</td>
                <td className="p-2 border">{entry.action}</td>
                <td className="p-2 border">{entry.credits}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CreditsHistoryPage;