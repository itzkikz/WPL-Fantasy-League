const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wpl-fantasy-league.onrender.com';

export const fetchRecords = async () => {
  const response = await fetch(`${API_URL}/api/getData`);
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

export const fetchLineup = async (teamName, gameweek) => {
  const response = await fetch(`${API_URL}/api/getLineup/${encodeURIComponent(teamName)}/${gameweek}`);
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

export const fetchPlayer = async (playerName) => {
  const response = await fetch(`${API_URL}/api/getPlayer/${encodeURIComponent(playerName)}`);
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

export const addRecord = async (data) => {
  const response = await fetch(`${API_URL}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add record');
  return response.json();
};

export const updateRecord = async (id, data) => {
  const response = await fetch(`${API_URL}/api/data/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update record');
  return response.json();
};

export const deleteRecord = async (id) => {
  const response = await fetch(`${API_URL}/api/data/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete record');
  return response.json();
};

export const searchRecords = async (field, value) => {
  const response = await fetch(
    `${API_URL}/api/search?field=${field}&value=${value}`
  );
  if (!response.ok) throw new Error('Failed to search');
  return response.json();
};
