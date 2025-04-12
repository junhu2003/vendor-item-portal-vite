import { ExtItemResponse } from '../types/sditem/sdItemTypes';
import { Users, 
    UserLevel, 
    Store, 
    StoreCreation,
    UserStoreRelation, 
    item, 
    SendItemHistory } from '../types/vpadmin/vpAdminTypes';
import bcryptjs from 'bcryptjs';

const apiBaseUrl = import.meta.env.VITE_API_URL;

export async function GetAllVpUsers(): Promise<Users[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetAllVpUsers'    
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
        return [];
    }
}

export async function GetMyVpUsers(myUserID: string | null): Promise<Users[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetMyVpUsers?myUserID=' + myUserID;    
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
        return [];
    }
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

export async function UpdateVpUser(user: Users[]): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/UpdateVpUser';  
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(user)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function CreateVpUser(user: Users): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/CreateVpUser';  
    const newUser: Users = {
        UserID: undefined,
        Name: user.Name,
        Email: user.Email,
        Password: await bcryptjs.hash('123456', 10),
        ManagerUserID: user.ManagerUserID,
        UserLevelID: user.UserLevelID,
        IsNewUser: user.IsNewUser,
    };
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(newUser)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function DeleteVpUser(userID: string): Promise<number> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/DeleteVpUser?userID=' + userID;  
    const response = await fetch(reqUrl, { 
        method: 'DELETE', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    if (response.ok && response.status === 200) {
        return (Number)(await response.text());
    } else {
        return 0;
    }
}

export async function GetAllStores(): Promise<Store[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetAllStores'    
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
        return [];
    }
}

export async function GetUserStores(userID: string): Promise<Store[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetUserStores?userID=' + userID;  
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
        return [];
    }
}

export async function UpdateStores(stores: Store[]): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/UpdateStores';  
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(stores)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function CreateStore(storeCreator: StoreCreation): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/CreateStore';    
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(storeCreator)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function DeleteStore(storeID: number): Promise<number> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/DeleteStore?storeID=' + storeID;  
    const response = await fetch(reqUrl, { 
        method: 'DELETE', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    if (response.ok && response.status === 200) {
        return (Number)(await response.text());
    } else {
        return 0;
    }
}

export async function GetAllUserStoreRelations(): Promise<UserStoreRelation[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetAllUserStoreRelations'    
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
        return [];
    }
}

export async function GetMyUserStoreRelations(userID: string): Promise<UserStoreRelation[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetMyUserStoreRelations?userID=' + userID;  
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
        return [];
    }
}

export async function UpdateUserStoreRelations(relations: UserStoreRelation[]): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/UpdateUserStoreRelations';  
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(relations)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function CreateUserStoreRelation(relation: UserStoreRelation): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/CreateUserStoreRelation';    
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(relation)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function DeleteUserStoreRelation(relationID: number): Promise<number> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/DeleteUserStoreRelation?relationID=' + relationID;  
    const response = await fetch(reqUrl, { 
        method: 'DELETE', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    if (response.ok && response.status === 200) {
        return (Number)(await response.text());
    } else {
        return 0;
    }
}

export async function GetAllVpUserLevels(): Promise<UserLevel[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetAllVpUserLevels'    
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
        return [];
    }
}

export async function GetVpItems(publicKey: string, userIds: string): Promise<item[]> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetVpItems?publicKey=' + publicKey + '&userIds=' + userIds;    
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
        return [];
    }
}

export async function CreateVpItems(items: item[]): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/CreateVpItems';
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(items)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function UpdateVpItems(items: item[]): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/UpdateVpItems'    
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(items)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function DeleteVpItem(itemID: number): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/DeleteVpItem?itemID=' + itemID;    
    const response = await fetch(reqUrl, { 
        method: 'DELETE', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function GetLastSendItemHistory(itemID: number): Promise<SendItemHistory | null> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/GetLastSendItemHistory?itemID=' + itemID;    
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

export async function CreateSendItemHistory(sendItemHistory: SendItemHistory[]): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/CreateSendItemHistory'    
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(sendItemHistory)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}

export async function UpdateItemByResponse(res: ExtItemResponse): Promise<boolean> {
    var reqUrl = apiBaseUrl + '/api/VpItem/v1/UpdateItemByResponse'    
    const response = await fetch(reqUrl, { 
        method: 'POST', 
        credentials: 'include', 
        mode: 'cors', 
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(res)});
    if (response.ok && response.status === 200) {
        return response.json();
    } else {
        return false;
    }
}