
import { 
    Department, 
    Category, 
    TaxCode, 
    Brand, 
    ReportCode,      
    ExtItemResponse } from "../types/sditem/sdItemTypes";
import { ExtItem } from "../types/vpadmin/vpAdminTypes";

const apiBaseUrl = import.meta.env.VITE_API_URL;

export async function getDepartments(publicToken: string): Promise<Department[]> {    
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetDepartments?publicToken=' + publicToken;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function getALLCategories(publicToken: string): Promise<Category[]> {        
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetAllCategories?publicToken=' + publicToken;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function getCategoriesByDept(publicToken: string, departmentID: string): Promise<Category[]> {        
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetAllCategories?publicToken=' + publicToken + '&departmentID=' + departmentID;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function getTaxCodes(publicToken: string): Promise<TaxCode[]> {        
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetTaxCodes?publicToken=' + publicToken;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function getBrands(publicToken: string): Promise<Brand[]> {        
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetBrands?publicToken=' + publicToken;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function getReportCodes(publicToken: string): Promise<ReportCode[]> {        
    var reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetReportCodes?publicToken=' + publicToken;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function barcodesDuplicationCheck(publicToken: string, barcodeString: string): Promise<boolean> {        
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/BarcodesDuplicationCheck?publicToken=' + publicToken + '&barcodeString=' + barcodeString;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    const text = await response.text();
    return text === 'true';
}

export async function itemNumberDuplicationCheck(publicToken: string, itemNumber: string): Promise<boolean> {        
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/ItemNumberDuplicationCheck?publicToken=' + publicToken + '&itemNumber=' + itemNumber;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    const text = await response.text();
    return text === 'true';
}

export async function getItemTypes(): Promise<string[]> {    
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetItemTypes';    
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function getItemStatuses(): Promise<string[]> {    
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/GetItemStatuses';
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    return response.json();
}

export async function postItems(extItems: ExtItem): Promise<ExtItemResponse[]> {
    const reqUrl = apiBaseUrl  + '/api/SdItem/v1/PostItems';
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(extItems)});    
    return response.json();
}

export async function IsStoreExistByPublicToken(publicToken: string): Promise<boolean> {
    const reqUrl = apiBaseUrl  + '/api/SdWeb/v1/IsStoreExistByPublicToken?publicToken=' + publicToken;
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});    
    const text = await response.text();
    return text === 'true';
}