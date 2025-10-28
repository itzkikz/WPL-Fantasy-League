
let sheets: { spreadsheets: { values: { get: ({ }) => Promise<{ data: { values: [] } }> } } } | undefined;

export const setSheets = (sheetsFn: { spreadsheets: { values: { get: ({ }) => Promise<{ data: { values: [] } }> } } } | undefined) => {
    sheets = sheetsFn;
}

export const getSheets = () => {
    return sheets;
}

