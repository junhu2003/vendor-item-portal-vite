
import { Department, 
    Category, 
    DeptCategories,      
    TaxCode, 
    Brand, 
    ReportCode,
    PriceLevel } from '../types/sditem/sdItemTypes';    
import { getDepartments, 
  getALLCategories, 
  getTaxCodes, 
  getBrands, 
  getReportCodes, 
  getItemTypes,
  getItemStatuses,
  GetPriceLevels } from '../api/sd-item-api';


export async function getDeptLabels(publicToken: string): Promise<{label: string, value: string}[]> {
    const departments: Department[] = await getDepartments(publicToken);        
    const uniqueList = Array.from(
        new Map(departments.map(dept => [dept.DepartmentName, {
            label: dept.DepartmentName,
            value: dept.DepartmentID.toString(),
        }])).values()
    );
    return uniqueList;    
}

export async function getCategoryLabels(publicToken: string): Promise<DeptCategories[]> {
    const categories: Category[] = await getALLCategories(publicToken);
    const uniqueDeptIds = [...new Set(categories.map(item => item.DepartmentID))];

    let deptCategories : DeptCategories[] = [];
    uniqueDeptIds.forEach((deptID) => {
        const categoryByDept = categories.filter(x => x.DepartmentID === deptID);
        const uniqueList = Array.from(
            new Map(categoryByDept.map(category => [category.CategoryName, {
                label: category.CategoryName,
                value: category.CategoryID.toString()
            }])).values()
        );

        deptCategories.push({
            DepartmentID: deptID.toString(),
            Categories: uniqueList
        });
    });

    return deptCategories;    
}

export async function getTaxCodeLabels(publicToken: string): Promise<{label: string, value: string}[]> {
    const taxCodes: TaxCode[] = await getTaxCodes(publicToken);
    const uniqueList = Array.from(
        new Map(taxCodes.map(code => [code.TaxCodeName, {
            label: code.TaxCodeName,
            value: code.TaxCodeID.toString()
        }])).values()
    );
    return uniqueList;    
}

export async function getBrandLabels(publicToken: string): Promise<{label: string, value: string}[]> {
    const brands: Brand[] = await getBrands(publicToken);
    const uniqueList = Array.from(
        new Map(brands.map(brand => [brand.BrandName, {
            label: brand.BrandName,
            value: brand.BrandName //brand.BrandID.toString()
        }])).values()
    );
    return uniqueList;    
}

export async function getReportCodeLabels(publicToken: string): Promise<{label: string, value: string}[]> {
    const codes: ReportCode[] = await getReportCodes(publicToken);
    const uniqueList = Array.from(
        new Map(codes.map(code => [code.ReportCodeName, {
            label: code.ReportCodeName,
            value: code.ReportCodeID.toString()
        }])).values()
    );
    return uniqueList;    
}

export async function getItemTypeLabels(): Promise<{label: string, value: string}[]> {
    const itemTypes: string[] = await getItemTypes();
    const list = itemTypes.map((itemType) => {
        return {
            label: itemType,
            value: itemType
        }
    });

    return list;    
}

export async function getItemStatusLabels(): Promise<{label: string, value: string}[]> {
    const statuses: string[] = await getItemStatuses();
    const list = statuses.map((status) => {
        return {
            label: status,
            value: status
        }
    });

    return list;    
}

export async function getPriceLevelLabels(publicToken: string): Promise<{label: string, value: string}[]> {
    const levels: PriceLevel[] = await GetPriceLevels(publicToken);
    const list = levels.map((level) => {
        return {
            label: level.PriceLevelName,
            value: level.PriceLevel.toString()
        }
    });

    return list;
}
