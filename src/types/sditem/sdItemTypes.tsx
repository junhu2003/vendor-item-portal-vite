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

export type ExtItemResponse = {
    ExtItemID: number;
    SdItemID: number;
    Message: string;
    Action: string;
    Status: string;
    SendDate: Date;
}

export type PriceLevel = {
    PriceLevel: number,
    PriceLevelName: string,
    PriceLevelDesc: string,
    UID: number,
    PriceLevelSyncCode: string
}

export type ExtPriceLevel = {
    PublicToken: string,
    PriceLevel: PriceLevel
}

export type ItemPriceLevel = {
    ItemID: number,
    PriceLevel: number,
    Price: number,
    UID: number,
    OmniPriceLevelID: number
}

export type ExtItemPriceLevel = {
    PublicToken: string,
    ItemPriceLevel: ItemPriceLevel
}

export type Barcode = {
    Barcode: string,
    ItemID: number,
    UID: number,
    Qty: number
}

export type PostBarcodeJson = {
    PublicKey: string;
    ItemID: number,
    BarcodeString: string
}