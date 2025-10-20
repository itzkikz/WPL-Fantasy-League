// Helper function: Convert sheet data to JSON with normalized headers
function convertToJSON(rows) {
  if (!rows || rows.length === 0) return [];
  
  // Normalize headers: replace spaces with underscores and convert to lowercase
  const headers = rows[0].map(header => 
    header
      .toString()
      .trim()
      .replace(/\s+/g, '_') // Replace all spaces with underscores
      .toLowerCase() // Optional: convert to lowercase for consistency
  );
  
  const data = rows.slice(1); // Remaining rows = values
  
  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || null;
    });
    return obj;
  });
}


module.exports = {convertToJSON}