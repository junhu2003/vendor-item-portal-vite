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

export function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const formElements = Array.from(
            document.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])')
        ).filter((el) => !(el as HTMLInputElement).disabled);

        let index = formElements.indexOf(event.currentTarget);
        if (index > -1) {
            index++;
            while (index < formElements.length) {                
                const nextElement = formElements[index] as HTMLElement;
                if (nextElement.tagName === 'INPUT' && (nextElement as HTMLInputElement).type === 'hidden') {
                    index++;
                } else if (nextElement.tagName === 'BUTTON') {
                    (nextElement as HTMLButtonElement).click();                 
                    index++;                    
                } else {
                    (nextElement as HTMLInputElement).focus();
                    break;
                }
            }            
        }
    }
}