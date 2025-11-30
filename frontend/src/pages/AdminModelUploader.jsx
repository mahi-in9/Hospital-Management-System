import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export default function AdminModelUploader() {
  const [roomId, setRoomId] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [useDevUpload, setUseDevUpload] = useState(false);
  const [models, setModels] = useState([]);
  const [tenantFilter, setTenantFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchModels = useCallback(async () => {
    try {
      const params = { page, limit };
      if (tenantFilter) params.tenantId = tenantFilter;
      const res = await apiClient.get('/protected/models', { params });
      const data = res.data.data || {};
      setModels(data.items || data);
      setTotal(data.total || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      setModels([]);
      console.warn('Could not fetch models', err?.response?.data || err.message);
    }
  }, [page, limit, tenantFilter]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setStatus('Please select a GLB/GLTF file');
    const form = new FormData();
    form.append('file', file);
    if (roomId) form.append('roomId', roomId);
    try {
      setStatus('Uploading...');
      let res;
      if (useDevUpload) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        res = await fetch(`${API_BASE}/models/dev-upload`, {
          method: 'POST',
          body: form,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Upload failed');
        setStatus('Uploaded');
        setPreviewUrl(json.data?.url);
      } else {
        res = await apiClient.post('/protected/models/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = res.data.data;
        setStatus('Uploaded');
        setPreviewUrl(data.url);
        // refresh list
        fetchModels();
      }
    } catch (err) {
      setStatus(err.response?.data?.message || err.message || 'Upload failed');
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      await apiClient.delete(`/protected/models/${encodeURIComponent(filename)}`);
      setStatus('Deleted');
      // refresh, keep same page
      fetchModels();
    } catch (err) {
      setStatus(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">Admin: Upload Room Model (GLTF/GLB)</h2>
        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">Room ID (e.g. room-opd-demo-hospital)</label>
            <input value={roomId} onChange={(e) => setRoomId(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder="optional - will be prefixed with tenant when protected" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model File (GLB/GLTF)</label>
            <input type="file" accept=".glb,.gltf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1 block w-full" />
          </div>

          <div className="flex items-center space-x-2">
            <input id="devUpload" type="checkbox" checked={useDevUpload} onChange={(e) => setUseDevUpload(e.target.checked)} />
            <label htmlFor="devUpload" className="text-sm text-gray-600">Use dev upload (no auth, dev only)</label>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Tenant Filter (admin)</label>
              <input value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} placeholder="optional tenantId" className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Page</label>
              <input type="number" value={page} min={1} onChange={(e) => setPage(Math.max(1, parseInt(e.target.value || '1', 10)))} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Per Page</label>
              <select value={limit} onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value || '20', 10)))} className="mt-1 block w-full border rounded p-2">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <button type="button" onClick={() => { setPage(1); fetchModels(); }} className="px-3 py-1 bg-gray-200 rounded">Apply</button>
            <div className="text-sm text-gray-600">Page {page} — {Math.ceil((total || 0) / limit || 0)} pages</div>
            <div className="ml-auto space-x-2">
              <button type="button" onClick={() => { setPage(Math.max(1, page - 1)); }} className="px-3 py-1 bg-white border rounded">Prev</button>
              <button type="button" onClick={() => { setPage(page + 1); }} className="px-3 py-1 bg-white border rounded">Next</button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Upload</button>
            <div className="text-sm text-gray-600">{status}</div>
          </div>

          {previewUrl && (
            <div className="mt-4">
              <div className="text-sm text-gray-600">Preview URL</div>
              <a className="text-indigo-600" href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium">Uploaded Models</h3>
            <div className="mt-3 bg-white rounded shadow overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2">Filename</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Preview</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {models.length === 0 && (
                    <tr><td colSpan={4} className="px-3 py-2 text-gray-500">No models found or you are not authenticated.</td></tr>
                  )}
                  {models.map((m) => (
                    <tr key={m.filename} className="border-b">
                      <td className="px-3 py-2">{m.filename}</td>
                      <td className="px-3 py-2">{Math.round(m.size / 1024)} KB</td>
                      <td className="px-3 py-2"><a className="text-indigo-600" href={m.url} target="_blank" rel="noreferrer">Open</a></td>
                      <td className="px-3 py-2"><button onClick={() => handleDelete(m.filename)} className="text-sm text-red-600">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
