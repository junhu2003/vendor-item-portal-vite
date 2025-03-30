import { Users, 
    UserLevel, 
    Store, 
    UserStoreRelation, 
    item, 
    SendItemHistory } from '../types/vpadmin/vpAdminTypes';

const apiBaseUrl = import.meta.env.VITE_API_URL;

export async function getAllVpUsers(): Promise<Users[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetAllVpUsers'    
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

export async function GetVpUserByEmail(email: string): Promise<Users | null> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetVpUserByEmail?email=' + email;  
    const response = await fetch(reqUrl, { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return null;
    }
}