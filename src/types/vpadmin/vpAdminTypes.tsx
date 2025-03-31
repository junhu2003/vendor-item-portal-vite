
export type Users = {
    UserID?: string,
	Name: string,
	Email: string,
	Password: string,
	UserLevelID: string,
	IsNewUser: boolean,
  };

export type UserLevel = {
    ID: number,
    Name: string,
};

export type Store = {
    StoreID: number,
	StoreName: string,
	HeadOfficeName: string,
	StoreToken: string,
	HeadOfficeToken: string,
};

export type UserStoreRelation = {
    UserID: string,
	StoreID: number,
};

export type item = {
    ItemID: number,
    DepartmentID: number,
    CategoryID: number,
    ItemName: string,
    ItemDesc: string,
    ItemNumber?: string,
    TaxCodeID: number,
    UnitPrice: number,
    UnitCost: number,
    STS: string,
    ItemType: string,
    BrandID: number,
    Barcode: string,
    ReportCode?: string,
    ImageFileName?: string,
    ImageFileData: string,
    ManualPrice: boolean,
    Discountable: boolean,
    Inventory: boolean,
    AvailableOnWeb: boolean,
    BtlDepositInPrice: boolean,
    BtlDepositInCost: boolean,
    EcoFeeInPrice: boolean,
    EcoFeeInCost: boolean,
    SdItemID?: number,
    LastAction?: string,
    LastStatus?: string,
    LastSendDate?: Date,
    CreatedDate?: Date,
    CreateUserID?: string
};

export type SendItemHistory = {
    ID: number,
	ExtItemID: number,
	Action?: string,
	Status?: string,
	ResponseMsg?: string,
	SendUserID?: string,
	SendDate: Date,
};