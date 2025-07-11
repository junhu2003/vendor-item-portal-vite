
export type Users = {
    UserID: string | undefined,
	Name: string,
	Email: string,
	Password: string,
	UserLevelID: string,
    ManagerUserID?: string,
	IsNewUser: boolean,
  };

export type UserLevel = {
    UserLevelID: number,
    Name: string,
};

export type Store = {
    StoreID: number,
	StoreName: string,
	HeadOfficeName: string,	
	HeadOfficeToken: string,
};

export type UserStoreRelation = {
    RelationID: number;
    UserID: string,
	StoreID: string,
};

export type item = {
    ItemID: number | string,
    DepartmentID?: number | string,
    CategoryID?: any,
    ItemName?: string,
    ItemDesc?: string,
    ItemNumber?: string,
    TaxCodeID?: number | string,
    UnitPrice?: number,
    UnitCost?: number,
    STS?: string,
    ItemType?: string,
    Brand?: string | undefined,
    Barcode?: string,
    ReportCode?: string,
    ImageFileName?: string,
    ImageFileData?: string,
    ManualPrice?: boolean,
    Discountable?: boolean,
    Inventory?: boolean,
    AvailableOnWeb?: boolean,
    BtlDepositInPrice?: boolean,
    BtlDepositInCost?: boolean,
    EcoFeeInPrice?: boolean,
    EcoFeeInCost?: boolean,
    SdItemID?: string | number,
    LastAction?: string,
    LastStatus?: string,
    LastSendDate?: Date,
    CreatedDate?: Date,
    CreateUserID?: string
};

export type itemExt = item & {
    BrandID?: string | undefined,
}

export type SendItemHistory = {
    ID: number,
	ExtItemID: number,
	Action?: string,
	Status?: string,
	ResponseMsg?: string,
	SendUserID?: string,
	SendDate: Date,
};

export type SendItemStatus = {
    id: number;
    status: string;
}

export type ExtItem = {
    PublicKey: string;
    ExtItems: item[]; 
}

export type StoreCreation = {
    NewStore?: Store,
    CreateUser: Users | null,
}

export type MantineTableColumnVisibility = {
    UserID: string,
    MaintineTableName: string,
    ColumnVisibilityValue: string | undefined,
}
