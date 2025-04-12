export function formatToGuid(raw: string): string {
    // Remove any non-alphanumeric characters
    const cleanString = raw.replace(/[^a-zA-Z0-9]/g, '');
    
    // Make sure we have enough characters
    if (cleanString.length < 32) {
        throw new Error('Input string is too short to format as a GUID');
    }
    
    // Format as GUID pattern (8-4-4-4-12)
    const guid = cleanString.substring(0, 8) + '-' + 
                cleanString.substring(8, 12) + '-' + 
                cleanString.substring(12, 16) + '-' + 
                cleanString.substring(16, 20) + '-' + 
                cleanString.substring(20, 32);
    
    return guid;
}

export function isValidGuid(guid: string): boolean {
    const regex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return regex.test(guid);
}