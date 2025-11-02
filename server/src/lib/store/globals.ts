
let sheets: { spreadsheets: { values: { get: ({ }) => Promise<{ data: { values: [] } }>, batchUpdate: ({ }) => Promise<{ data: { values: [] } }>, append: ({ }) => Promise<{ data: { values: [] } }>, batchGet: ({ }) => Promise<{ data: { valueRanges: [] } }> } } } | undefined;

export const setSheets = (sheetsFn: { spreadsheets: { values: { get: ({ }) => Promise<{ data: { values: [] } }>, batchUpdate: ({ }) => Promise<{ data: { values: [] } }>, append: ({ }) => Promise<{ data: { values: [] } }>, batchGet: ({ }) => Promise<{ data: { valueRanges: [] } }> } } } | undefined) => {
    sheets = sheetsFn;
}

export const getSheets = () => {
    return sheets;
}

