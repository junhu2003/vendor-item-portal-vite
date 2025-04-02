export type Department = {
    DepartmentID: number;
    DepartmentName: string;
    DepartmentDesc: string;
    DepartmentCode: string;
    SortLine: number;
    Uid: number;
    AltDeptIdentifier: string;
    DeptSyncCode: string;
};

export type Category = {
    CategoryID: number;
    DepartmentID: number;
    CategoryCode: string;
    CategoryName: string;
    CategoryDesc: string;
    ModifierID: number;
    ProfitMargin: number;
    SortLine: number;
    MatrixID: number;
    Uid: number;
    IsModifier: true;
    ExpiryAlert: number;
    IsRestricted: true;
    AltCatIdentifier: string;
    IncludeInItemSalesOnClosingSlip: true;
    CatSyncCode: string;
};

export type TaxCode = {
    TaxCodeID: number,
    TaxCodeName: string,
    TaxCodeDesc: string,
    Indicator: string,
    Uid: number,
    AiIdentifier: string,
    IsRestricted: boolean,
    TaxCodeSyncCode: string
}

export type Brand = {
    BrandID: number,
    BrandName: string,
    BrandDesc: string
}

export type ReportCode = {
	ReportCodeID: number,
	ReportCodeName: string,
	ReportCodeDesc: string,
	Uid: number,
	ReportSyncCode: string
}

export type DeptCategories = {
    DepartmentID: string,
    Categories: { label: string, value: string }[]
}

export type Item = {
    ItemID: number;
    DepartmentID: number;
    CategoryID: number;    
    ItemName: string;
    ItemDesc: string;
    ItemNumber?: string;
    TaxCodeID: number;    
    UnitPrice: number;
    UnitCost: number;
    STS: string;
    ItemType: string;    
    BrandID: number;
    BanualPrice: boolean;
    Discountable: boolean;
    Inventory: boolean;
    AvailableOnWeb: boolean;
    BtlDepositInPrice: boolean;
	BtlDepositInCost: boolean;
    EcoFeeInPrice: boolean;
    EcoFeeInCost: boolean;	
    Barcode?: string;
	ReportCode: string;
	ImageFileName?: string;
	ImageFileData?: string;
    SdItemID?: number;
    LastAction?: string;
    LastStatus?: string;
    LastSendDate?: Date;
    CreatedDate?: Date;
    CreateUserID?: string;
};

export type ExtItems = {
    PublicKey: string;
    ExtItems: Item[]; 
}

export type ExtItemResponse = {
    ExtItemID: number;
    SdItemID: number;
    Message: string;
    Action: string;
    Status: string;
    SendDate: Date;
}

