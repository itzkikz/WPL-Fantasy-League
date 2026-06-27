// formationConverter.ts

// Position mapping

// Position mapping
const positionMap: Record<string, "GK" | "DEF" | "MID" | "FWD"> = {
    G: "GK",
    D: "DEF",
    M: "MID",
    F: "FWD",
};



// Helper function to map position
export const mapPosition = (pos: string): "GK" | "DEF" | "MID" | "FWD" => {
    return positionMap[pos] || (pos as "GK" | "DEF" | "MID" | "FWD");
};



