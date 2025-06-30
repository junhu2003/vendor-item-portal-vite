import { useEffect, useMemo, useState, useRef } from 'react';
import {  
  MantineReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_Cell,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import { ActionIcon, 
  Button, 
  Text, 
  Tooltip, 
  FileInput, 
  MultiSelect, 
  Switch, 
  Autocomplete, 
  TextInput, 
  NumberInput,
  Flex, 
  Divider, 
  Center,
  Select,
  Grid,
  Group
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconPencil, IconFileImport, IconCheck, IconX, IconCoins, IconBarcode, IconCirclePlus, IconRefresh } from '@tabler/icons-react';
import {  
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Barcode, DeptCategories, PostBarcodeJson, ItemPriceLevel, ExtItemPriceLevel } from '../types/sditem/sdItemTypes'; 
import { ExtItem, SendItemHistory, Store, Users, MantineTableColumnVisibility, itemExt } from '../types/vpadmin/vpAdminTypes';
import {
  getDeptLabels, 
  getCategoryLabels,
  getBrandLabels, 
  getTaxCodeLabels,   
  getReportCodeLabels,
  getItemTypeLabels,
  getItemStatusLabels,
  getPriceLevelLabels,
} from '../api/sd-item-api-helper';
import {
  barcodesDuplicationCheck,
  itemNumberDuplicationCheck,
  searchItems,
  postItems,
  getItemBarcodes,
  postItemBarcode,
  GetItemPriceLevels,
  CreateItemPriceLevel,
  UpdateItemPriceLevel,
  DeleteItemPriceLevel,  
} from '../api/sd-item-api';
import { 
  CreateVpItems,  
  DeleteVpItem, 
  GetLastSendItemHistory, 
  GetMyTableColumnVisibilitySetting,
  SetMyTableColumnVisibilitySetting,
} from '../api/vp-item-api';
import { ExtItemResponse } from '../types/sditem/sdItemTypes'; 
import { item } from '../types/vpadmin/vpAdminTypes';
import { useAuth } from '../context/AuthContext';
import { handleKeyPress } from '../helper/help-functions';

const SdItemMantineTable: React.FC<{selectedStore: Store | null}> = ({selectedStore}) => {
  const { loginUser } = useAuth();  

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const COLUMN_VISIBILITY_KEY = 'VpItemMantineTable';
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});
    
  //keep track of rows that have been edited  
  const [editedItems, setEditedItems] = useState<Record<string, itemExt>>({});  

  const [depts, setDepts] = useState<{ label: string, value: string }[]>([]);
  const [deptCategories, setDeptCategories] = useState<DeptCategories[]>([]);
  const [taxCodes, setTaxCodes] = useState<{ label: string, value: string }[]>([]);
  const [brands, setBrands] = useState<{ label: string, value: string }[]>([]); 
  const [rptCodes, setRptCodes] = useState<{ label: string, value: string }[]>([]); 
  const [itemTypes, setItemTypes] = useState<{ label: string, value: string }[]>([]);
  const [itemStatuses, setItemStatuses] = useState<{ label: string, value: string }[]>([]);

  const [itemName, setItemName] = useState<string>('');
  const [itemNumber, setItemNumber] = useState<string>('');

  const [refreshKey, setRefreshKey] = useState(0);  

  // manage item temporary switch state
  const [switchtates, setSwitchtates] = useState<{ 
    manualPrice: Boolean, 
    discountable: Boolean, 
    inventory: Boolean,
    availableOnWeb: Boolean,
    btlDepositInPrice: Boolean,
    btlDepositInCost: Boolean,
    ecoFeeInPrice: Boolean,
    ecoFeeInCost: Boolean    
   }[]>([]);
  
  const isSwitched = (cell: MRT_Cell<itemExt, unknown>, key: string, row: MRT_Row<itemExt>): Boolean => {
    return switchtates[Number(row.original.ItemID)] && switchtates[Number(row.original.ItemID)].hasOwnProperty(key) 
              ? Boolean(switchtates[Number(row.original.ItemID)][key as keyof typeof switchtates[0]]) : Boolean(cell.getValue());
  } 

  const fileInputRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // Read file as Base64
      reader.onload = () => resolve(reader.result as string); // Get Base64 string
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleFileChange = async (file: File | null, row: MRT_Row<itemExt>) => {    
    if (file) {
      const imgStr = await fileToBase64(file);

      setEditedItems({
        ...editedItems,
        [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), 
            ImageFileName: file.name, ImageFileData: imgStr },
      });
    }    
  };

  const openFileExplorer = (rowId: string) => {    
    fileInputRefs.current[rowId]?.click();
  };

  // Save to db table on visibility change
  const handleVisibilityChange = async (visibility: Record<string, boolean>) => {
    setColumnVisibility(visibility);

    const setting: MantineTableColumnVisibility = {      
      UserID: loginUser?.UserID ?? '',
      MaintineTableName: COLUMN_VISIBILITY_KEY,
      ColumnVisibilityValue: JSON.stringify(visibility),
    };

    await SetMyTableColumnVisibilitySetting(setting);
  };
  
  const queryClient = useQueryClient();
  useEffect(() => {
    
    const fetchData = async () => {

      if (selectedStore && selectedStore.HeadOfficeToken.length > 0) {

        // retrieve departments
        const deptLabels = await getDeptLabels(selectedStore.HeadOfficeToken);
        setDepts(deptLabels);

        // retrieve categories
        const cateLabels = await getCategoryLabels(selectedStore.HeadOfficeToken);
        setDeptCategories(cateLabels);

        // retrieve tax codes
        const codeLabels = await getTaxCodeLabels(selectedStore.HeadOfficeToken);
        setTaxCodes(codeLabels);

        // retrieve brands
        const brandLabels = await getBrandLabels(selectedStore.HeadOfficeToken);
        setBrands(brandLabels);

        // retrieve report codes
        const rptCodeLabels = await getReportCodeLabels(selectedStore.HeadOfficeToken);
        setRptCodes(rptCodeLabels);

        // retrieve item types
        const itemTypeLabels = await getItemTypeLabels();      
        setItemTypes(itemTypeLabels);

        // retrieve item statuses
        const itemStatusLabels = await getItemStatusLabels();
        setItemStatuses(itemStatusLabels);    
      }      
    }
    
    fetchData();

    const fetchColumnVisibility = async () => {
      const setting = await GetMyTableColumnVisibilitySetting(loginUser?.UserID ?? '', COLUMN_VISIBILITY_KEY);
      setColumnVisibility(setting && setting.ColumnVisibilityValue ? JSON.parse(setting.ColumnVisibilityValue) : {});
    };

    fetchColumnVisibility();

    queryClient.invalidateQueries({ queryKey: ['items'] });
  }, [selectedStore, loginUser?.UserID]);

  //call CREATE hook
  const { mutateAsync: createItem, isPending: isCreatingItem } =
    useCreateItem(loginUser);
  //call READ hook
  const {
    data: fetchedItems = [],
    isError: isLoadingItemsError,
    isFetching: isFetchingItems,
    isLoading: isLoadingItems,
    refetch: refetchItems, 
  } = useGetItems(selectedStore, itemName, itemNumber);
  //call UPDATE hook
  const { mutateAsync: updateItems, isPending: isUpdatingItem } =
    useUpdateItems(selectedStore);
  //call DELETE hook
  const { mutateAsync: deleteItem, isPending: isDeletingItem } =
    useDeleteItem();

  //CREATE action
  const handleCreateItem: MRT_TableOptions<itemExt>['onCreatingRowSave'] = async ({
    row,
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateItem(values);
    if (Object.values(newValidationErrors).some((error) => !!error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createItem([editedItems[row.id]]);
    exitCreatingMode();
  };

  //UPDATE action
  const handleSaveItems = async () => {
    if (Object.values(validationErrors).some((error) => !!error)) return;
    await updateItems(Object.values(editedItems));
    setEditedItems({});
  };  

  // open Add Item Barcode Dialog
  const openAddItemBarcodeDialog = (row: MRT_Row<itemExt>) => {
    modals.open({
      title: `Add Barcodes for Item ID: ${row.original.ItemID}`,
      children: (
        <AddItemBarcodeDialog 
          onClose={() => modals.closeAll()}
          onCloseRefresh={() => {            
            refetchItems().then(() => {
              setRefreshKey(k => k + 1); // trigger re-fetch
              modals.closeAll(); // ✅ wait until data is fresh
            });            
          }}           
          itemID={Number(row.original.ItemID)} 
        />
      ),
      size: 'md',
    });
  }  

  // add item barcodes
  function AddItemBarcodeDialog({ 
    onClose,
    onCloseRefresh,    
    itemID, 
  }: {
    onClose: () => void;     
    onCloseRefresh: () => void;    
    itemID: number;
  }) {
    const [barcodes, setBarcodes] = useState<Barcode[]>([]);
    const [loading, setLoading] = useState(true);
    const [newBarcode, setNewBarcode] = useState('');
    const [duplicate, setDuplicate] = useState(false);
    const [newBarcodeAdded, setNewBarcodeAdded] = useState(false);

    useEffect(() => {
      const fetchBarcodes = async () => {
        if (selectedStore && selectedStore.HeadOfficeToken.length > 0) {
          const fetchedBarcodes = await getItemBarcodes(selectedStore.HeadOfficeToken, itemID);
          setBarcodes(fetchedBarcodes);
        }
        setLoading(false);
      };
      fetchBarcodes();
    }, [selectedStore, itemID]);

    const addNewBarcode = async () => {
      setDuplicate(false);
      if (newBarcode.trim() === '') return;

      const isDuplicate = await barcodesDuplicationCheck(selectedStore?.HeadOfficeToken ?? '', newBarcode);
      if (isDuplicate) {
        setDuplicate(true);
        return;
      }

      const newBarcodeObj: PostBarcodeJson = {
        PublicKey: selectedStore?.HeadOfficeToken ?? '',
        ItemID: itemID,
        BarcodeString: newBarcode,
      };
      var isSuccessed = await postItemBarcode(newBarcodeObj);
      if (isSuccessed) {
        setBarcodes([...barcodes, { Barcode: newBarcode, ItemID: itemID, UID: 0, Qty: 0 }]);
        setNewBarcode('');
        setNewBarcodeAdded(true);        
      }
    }

    return (
      <div>   
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <Divider color="gray.6" />
            {barcodes.length > 0 ? (
              <Text mt='sm' mb='sm'>{barcodes.map(barcode => barcode.Barcode).join(', ')}</Text>              
            ) : (
              <Text mt='sm' mb='sm'>No barcodes found.</Text>
            )}

            <Flex align="center" gap="sm" mt='sm'>
              <TextInput
                placeholder='New Barcode'
                value={newBarcode}
                onChange={(e) => setNewBarcode(e.currentTarget.value)}                
                styles={{ label: { display: 'none' } }} // hide label                
              />
              <Button h={36} onClick={async () => { await addNewBarcode(); }}>
                Add Barcode
              </Button>
            </Flex>
            {
              duplicate && (
                <Text size="xs" color="red" ml='sm'>
                  Duplicate Barcode
                </Text>
              )
            }            
          </>
        )}
        <Divider color="gray.6" mt='sm' />
        <Center>
          <Button mt="sm" onClick={ newBarcodeAdded ? onCloseRefresh : onClose }>Close</Button>
        </Center>        
      </div>
    )
  }

  // open Add Price Level Dialog
  const openAddPriceLevelDialog = (row: MRT_Row<itemExt>) => {
    modals.open({
      title: `Add Price Levels for Item ID: ${row.original.ItemID}`,
      children: (
        <AddPriceLevelDialog 
          onClose={() => modals.closeAll()}                     
          itemID={Number(row.original.ItemID)} 
        />
      ),
      size: 'md',
    });
  }

  function AddPriceLevelDialog({ 
    onClose,    
    itemID, 
  }: {
    onClose: () => void;
    itemID: number;
  }) {
    const [loading, setLoading] = useState(true);    
    const [editingValue, setEditingValue] = useState<ItemPriceLevel | null>(null);
    const [newValue, setNewValue] = useState<ItemPriceLevel>({ ItemID: itemID, PriceLevel: 0, Price: 0, UID: 0, OmniPriceLevelID: 0 });
    const [priceLevelLabels, setPriceLevelLabels] = useState<{ label: string, value: string }[]>([]);
    const [itemPriceLevels, setItemPriceLevels] = useState<ItemPriceLevel[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
      const fetchPriceLevelData = async () => {
        if (selectedStore && selectedStore.HeadOfficeToken.length > 0) {
          const priceLevelLabels = await getPriceLevelLabels(selectedStore.HeadOfficeToken);
          setPriceLevelLabels(priceLevelLabels);

          const itemPriceLevels = await GetItemPriceLevels(selectedStore.HeadOfficeToken, itemID);
          setItemPriceLevels(itemPriceLevels);
        }
        setLoading(false);
      };
      fetchPriceLevelData();
    }, [selectedStore, itemID]);

    const handleEdit = (item: ItemPriceLevel) => {
      setEditingValue(item);
    };

    const handleSave = async () => {
      if (!editingValue) return;

      let updated: ExtItemPriceLevel = {
        PublicToken: selectedStore?.HeadOfficeToken ?? '',
        ItemPriceLevel: editingValue
      };
      await UpdateItemPriceLevel(updated);

      setItemPriceLevels((prev) =>
        prev.map((p) => (p.ItemID === editingValue.ItemID && p.PriceLevel === editingValue.PriceLevel ? editingValue : p))
      );

      setEditingValue(null);
    };

    const handleDelete = async (item: ItemPriceLevel) => {
      let deleted: ExtItemPriceLevel = {
        PublicToken: selectedStore?.HeadOfficeToken ?? '',
        ItemPriceLevel: item
      };
      await DeleteItemPriceLevel(deleted);

      setItemPriceLevels(itemPriceLevels.filter((p) => p.ItemID !== item.ItemID || p.PriceLevel !== item.PriceLevel));
    };

    const handleCancel = () => {
      setEditingValue(null);
    };
    
    const handlePriceChange = (val: number) => {
      if (editingValue) {
        setEditingValue((prev) => prev ? { ...prev, Price: val } : null);
      }
    }

    const handleCreate = async () => {
      if (newValue.PriceLevel === 0 || newValue.Price <= 0) {
        setErrorMsg('Please select a valid Price Level and enter a valid Price.');        
        return;
      }

      let created: ExtItemPriceLevel = {
        PublicToken: selectedStore?.HeadOfficeToken ?? '',
        ItemPriceLevel: newValue
      };
      var result = await CreateItemPriceLevel(created);
      if (result && result.name === 'Error') {
        setErrorMsg('Error when creating Price Level. Please check the values and try again.');
        return;
      } else {
        setItemPriceLevels((prev) => [...prev, newValue]);
        setNewValue({ ItemID: itemID, PriceLevel: 0, Price: 0, UID: 0, OmniPriceLevelID: 0 });
        setErrorMsg('');
      }      
    }

    return (
      <div>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <Divider color="gray.6" mb='sm' />
            <Grid gutter="xs" style={{ fontSize: '14px', fontWeight: 'bold' }}>
              <Grid.Col span={4}>Price Level</Grid.Col>
              <Grid.Col span={4}>Price</Grid.Col>
              <Grid.Col span={4}>Actions</Grid.Col>
            </Grid>

            {itemPriceLevels.map((item, index) => {
              const isEditing = item.ItemID === editingValue?.ItemID && item.PriceLevel === editingValue.PriceLevel;

              return (
                <Grid gutter="xs" key={index} align="center" style={{ fontSize: '12px' }}>
                  <Grid.Col span={4}>                    
                    <Text size="xs">
                      {priceLevelLabels.find(pl => pl.value === item.PriceLevel.toString())?.label || `Price Level ${item.PriceLevel}`}   
                    </Text>                    
                  </Grid.Col>

                  <Grid.Col span={4}>
                    {isEditing ? (
                      <NumberInput
                        size='xs'
                        value={editingValue.Price}
                        onChange={(val) => handlePriceChange(Number(val) ?? 0)}
                        decimalScale={2}
                        min={0}
                        step={0.01}
                      />
                    ) : (
                      <Text size="xs">
                        {item.Price.toFixed(2)} 
                      </Text>
                    )}
                  </Grid.Col>

                  <Grid.Col span={4}>
                    <Group gap="xs">
                      {isEditing ? (
                        <>
                          <ActionIcon color="green" onClick={() => handleSave()}>
                            <IconCheck size={18} />
                          </ActionIcon>
                          <ActionIcon color="gray" onClick={handleCancel}>
                            <IconX size={18} />
                          </ActionIcon>
                        </>
                      ) : (
                        <>
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(item)}>
                            <IconPencil size={18} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(item)}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                  </Grid.Col>
                </Grid>
              );
            })}            
          </>
        )}

        <Divider color="gray.6" mt='sm' mb='sm' />

        <Grid gutter="xs" align="center" style={{ fontSize: '12px' }}>
          <Grid.Col span={4}>                    
            <Select
              data={priceLevelLabels}
              value={newValue.PriceLevel.toString()}
              onChange={(val) => setNewValue({ ...newValue, PriceLevel: Number(val) })}
              placeholder="Select level"              
            />
          </Grid.Col>

          <Grid.Col span={4}>            
              <NumberInput
                size='xs'
                value={newValue.Price.toFixed(2)}
                onChange={(val) => setNewValue({ ...newValue, Price: Number(val) })}
                decimalScale={2}
                min={0}
                step={0.01}
              />            
          </Grid.Col>

          <Grid.Col span={4}>
            <Group gap="xs">              
              <>
                <ActionIcon color="green" onClick={() => handleCreate()}>
                  <IconCirclePlus size={18} />
                </ActionIcon>
                <ActionIcon color="gray" onClick={() => setNewValue({ ItemID: itemID, PriceLevel: 0, Price: 0, UID: 0, OmniPriceLevelID: 0 })}>
                  <IconRefresh size={18} />
                </ActionIcon>
              </>
            </Group>
          </Grid.Col>
        </Grid>
        {
          errorMsg.length > 0 && (
            <Text size="xs" color="red" ml='sm'>
              {errorMsg}              
            </Text>
          )
        } 

        <Divider color="gray.6" mt='sm' />
        <Center>
          <Button mt="sm" onClick={onClose}>Close</Button>
        </Center>
      </div>
    )
  }

  const columns = useMemo<MRT_ColumnDef<itemExt>[]>(    
    () => [      
      {
        accessorKey: 'Barcode',
        header: 'Barcode',
        size: 150,
        mantineEditTextInputProps: ({ cell, row, table }) => ({
          type: 'text',
          autoFocus: table.getState().creatingRow?.index === row.index,
          required: true,
          error: validationErrors?.[cell.id],
          //store edited item in state to be saved later
          onChange: async (event) => {
            const currentValue = event.currentTarget.value;
            const validationError = (selectedStore?.HeadOfficeToken ? await validateBarcodeDuplication(selectedStore?.HeadOfficeToken, currentValue) : false) 
                ? 'Duplicate Barcodes' 
                : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedItems({ 
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), Barcode: currentValue},
            });
          },
          onKeyDown: (e) => {
            handleKeyPress(e, 'Enter');
          },
        }),
      },
      {
        accessorKey: "BarcodeButton",
        header: "",
        size: 30,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ row }) => {              
          return (
            <>
              <Tooltip label="Add Alternate Barcodes">
                <ActionIcon style={{background: 'transparent'}} onClick={() => openAddItemBarcodeDialog(row)}>
                  <IconBarcode color='blue' />
                </ActionIcon>
              </Tooltip>              
            </>
          );
        },
      },
      {
        accessorKey: 'ItemNumber',
        header: 'Item No.',


        size: 150,
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited item in state to be saved later
          onChange: async (event) => {
            const currentValue = event.currentTarget.value;
            const validationError = (selectedStore?.HeadOfficeToken ? await validateItemNumberDuplication(selectedStore?.HeadOfficeToken, currentValue) : false) 
                ? 'Duplicate Item Numbers' 
                : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedItems({ 
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), ItemNumber: currentValue},
            });
          },
          onKeyDown: (e) => {
            handleKeyPress(e, 'Enter');
          },
        }),
      },      
      {
        accessorKey: 'ItemName',
        header: 'Name',
        size: 150,
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited item in state to be saved later
          onBlur: (event) => {            
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedItems({ 
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), ItemName: event.currentTarget.value },
            });
          },
          onKeyDown: (e) => {
            handleKeyPress(e, 'Enter');
          },
        }),
      },
      {
        accessorKey: 'ItemDesc',
        header: 'Description',
        size: 180,
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited item in state to be saved later
          onBlur: (event) => {            
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedItems({ 
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), ItemDesc: event.currentTarget.value },
            });
          },
          onKeyDown: (e) => {
            handleKeyPress(e, 'Enter');
          },
        }),
      },
      {
        accessorKey: 'UnitPrice',
        header: 'Price',
        size: 100,
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'number',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited item in state to be saved later
          onBlur: (event) => {            
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedItems({ 
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), UnitPrice: Number(event.currentTarget.value) },
            });
          },
          onKeyDown: (e) => {
            handleKeyPress(e, 'Enter');
          },
        }),
      },      
      {
        accessorKey: 'UnitCost',
        header: 'Cost',
        size: 100,
        mantineEditTextInputProps: ({ cell, row }) => ({
          type: 'number',
          required: true,
          error: validationErrors?.[cell.id],
          //store edited item in state to be saved later
          onBlur: (event) => {            
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedItems({ 
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), UnitCost: Number(event.currentTarget.value) },
            });
          },
          onKeyDown: (e) => {
            handleKeyPress(e, 'Enter');
          },
        }),
      },
      {
        accessorKey: 'DepartmentID',
        header: 'Department',
        size: 150,        
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: depts,
          //store edited item in state to be saved later
          onChange: (value: any) =>
            setEditedItems({
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), DepartmentID: value },
            }),
          onKeyDown: (e) => {
            handleKeyPress(e, 'ArrowRight');
          },
        }),          
      },      
      {
        accessorKey: 'CategoryID',
        header: 'Category',
        size: 150,        
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: deptCategories.find(x => x.DepartmentID === (editedItems[row.id] ? editedItems[row.id].DepartmentID : row.original.DepartmentID))?.Categories,
          //store edited item in state to be saved later
          onChange: (value: any) =>
            setEditedItems({
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), CategoryID: value },
            }),
          onKeyDown: (e) => {
            handleKeyPress(e, 'ArrowRight');
          },
        }),          
      },
      {
        accessorKey: 'TaxCodeID',
        header: 'Tax Code',
        size: 150,
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: taxCodes,          
          //store edited item in state to be saved later
          onChange: (value: any) =>
            setEditedItems({
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), TaxCodeID: value },
            }),
          onKeyDown: (e) => {
            handleKeyPress(e, 'ArrowRight');
          },  
        }),          
      },
      {
        accessorKey: 'ItemType',
        header: 'Type',
        size: 120,
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: itemTypes,
          //store edited item in state to be saved later
          onChange: (value: any) =>
            setEditedItems({
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), ItemType: value },
            }),
          onKeyDown: (e) => {
            handleKeyPress(e, 'ArrowRight');
          },
        }),
      },
      {
        accessorKey: 'STS',
        header: 'STS',
        size: 120,
        editVariant: 'select',
        mantineEditSelectProps: ({ row }) => ({
          data: itemStatuses,
          //store edited item in state to be saved later
          onChange: (value: any) =>
            setEditedItems({
              ...editedItems,
              [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), STS: value },
            }),
          onKeyDown: (e) => {
            handleKeyPress(e, 'ArrowRight');
          },
        }),
      },
      {
        accessorKey: 'Brand',
        header: 'Brand',
        size: 150,
        // 👇 Custom editing logic using Mantine's Autocomplete
        Edit: ({ cell, row }) => (
          <Autocomplete
            data={brands}
            defaultValue={cell.getValue<string>()}
            onChange={(value: any) => {
              setEditedItems({
                ...editedItems,
                [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), Brand: value },
              })
            }}
            onKeyDown={(e) => handleKeyPress(e, 'ArrowRight')}
            placeholder="Type or select"
            clearable            
          />          
        ),        
      },
      {
        accessorKey: "ReportCode",
        header: "Report Codes",
        size: 500, 
        enableEditing: false,
        Cell: ({ row }) => {
          const curItem = editedItems[row.id] ? editedItems[row.id] : row.original;
          return (            
            <MultiSelect
              data={rptCodes}
              value={curItem.ReportCode ? curItem.ReportCode.split(',') : []}
              onChange={(value: any) => {
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(curItem), ReportCode: value.join(',')},
                });                
              }}
              onKeyDown={(e) => handleKeyPress(e, 'ArrowRight')}
              placeholder="Select options"              
              searchable
              clearable              
            />            
          );
        },        
      },
      {
        accessorKey: "ImageFileName",
        header: "File",
        size: 120,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ row }) => {              
          return (
            <>
              <Tooltip label="Select image file">
                <ActionIcon style={{background: 'transparent'}} onClick={() => openFileExplorer(row.id)}>
                  <IconFileImport color='blue' />
                </ActionIcon>
              </Tooltip>
              <FileInput                    
                ref={(el) => (fileInputRefs.current[row.id] = el)}
                placeholder="Select image file"   
                accept="image/png,image/jpeg"               
                onChange={(file) => handleFileChange(file, row)}
                style={{display: 'none'}}
              />
            </>
          );
        },
      },
      {
        accessorKey: 'ManualPrice',
        header: 'MP',
        size: 80,        
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch              
              checked={!!isSwitched(cell, 'manualPrice', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], manualPrice: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), ManualPrice: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'Discountable',
        header: 'Dis',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'discountable', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], discountable: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), Discountable: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'Inventory',
        header: 'Inv',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'inventory', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], inventory: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), Inventory: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'AvailableOnWeb',
        header: 'AOW',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'availableOnWeb', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], availableOnWeb: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), AvailableOnWeb: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'BtlDepositInPrice',
        header: 'BDP',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'btlDepositInPrice', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], btlDepositInPrice: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), BtlDepositInPrice: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'BtlDepositInCost',
        header: 'BDC',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'btlDepositInCost', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], btlDepositInCost: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), BtlDepositInCost: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'EcoFeeInPrice',
        header: 'EcoP',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'ecoFeeInPrice', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], ecoFeeInPrice: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), EcoFeeInPrice: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },
      {
        accessorKey: 'EcoFeeInCost',
        header: 'EcoC',
        size: 80,
        enableEditing: false, // Prevent editing for file column
        Cell: ({ cell, row }) => {          
          return (            
            <Switch
              checked={!!isSwitched(cell, 'ecoFeeInCost', row)}
              onChange={(event: any) => {
                const status = event.currentTarget.checked;
                setSwitchtates({ 
                  ...switchtates, 
                  [Number(row.original.ItemID)]: {...switchtates[Number(row.original.ItemID)], ecoFeeInCost: status}
                });                
                setEditedItems({
                  ...editedItems,
                  [row.id]: { ...(editedItems[row.id] ? editedItems[row.id] : row.original), EcoFeeInCost: status },
                });
              }}
              onKeyDown={(e) => {handleKeyPress(e, 'Enter')}}
              size='xs'
            />
          );
        },        
      },      
    ],
    [editedItems, validationErrors, depts, deptCategories, taxCodes, brands, rptCodes, 
      itemTypes, itemStatuses, selectedStore, fetchedItems],
  );

  const table = useMantineReactTable({    
    columns,
    data: fetchedItems,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also available)
    enableEditing: true,
    enableRowActions: true,  
    enableRowSelection: false,    
    enableColumnResizing: true,
    enableColumnOrdering: false,    
    positionActionsColumn: 'first',
    getRowId: (row) => row.ItemID ? row.ItemID.toString() : undefined,
    mantineToolbarAlertBannerProps: isLoadingItemsError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,
    
    mantineTableProps: {
      className: 'custom-table',
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateItem,
    renderRowActions: ({ row }) => (
      <div className='flex items-centers space-x-1' style={{ width: '200px' }}>        
        <Tooltip label="Add Price Level">
          <ActionIcon style={{background: 'transparent'}} onClick={() => openAddPriceLevelDialog(row)}>
            <IconCoins color='purple' />
          </ActionIcon>
        </Tooltip>        
      </div>
    ),
    displayColumnDefOptions:{
      'mrt-row-actions': {
        size: 55, // 👈 try 120–140px for 3 buttons
        maxSize: 130,
        minSize: 55,
      },
    },
    renderBottomToolbarCustomActions: () => (
      <div className="flex items-center space-x-2">        
        <Button
          color="blue"
          onClick={handleSaveItems}
          disabled={
            Object.keys(editedItems).length === 0 ||
            Object.values(validationErrors).some((error) => !!error)
          }
          loading={isUpdatingItem}
        >
          Save Modified items
        </Button>
      </div>
    ),
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center space-x-2">
        <TextInput
          placeholder="Search by Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={{ width: '200px' }}
        />
        <TextInput
          placeholder="Search by Item Number"
          value={itemNumber}
          onChange={(e) => setItemNumber(e.target.value)}
          style={{ width: '200px' }}
        />
      <Button
        onClick={() => {
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }}
      >
        Search SD Items
      </Button>
      </div>
    ),
    onColumnVisibilityChange: (updaterOrValue) => {
      const newVisibility =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(columnVisibility)
          : updaterOrValue;
      handleVisibilityChange(newVisibility);
    },
    state: {
      isLoading: isLoadingItems,
      isSaving: isCreatingItem || isUpdatingItem || isDeletingItem,
      showAlertBanner: isLoadingItemsError,
      showProgressBars: isFetchingItems,
      columnVisibility,
    },
  });

  return (
    <div>
      {/*toast*/}
      { selectedStore && selectedStore.HeadOfficeToken.length > 0 
        && <MantineReactTable table={table} key={refreshKey} /> }
      
    </div>    
  );
};

//CREATE hook (post new item to api)
function useCreateItem(loginUser: Users | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: itemExt[]) => {
      //send api CREATE request here
      const newItems = items.map((t) => ({
        ItemID: 0, //t.ItemID,
        //DepartmentID: Number(t.DepartmentID),
        CategoryID: Number(t.CategoryID),
        ItemName: t.ItemName,
        ItemDesc: t.ItemDesc,
        ItemNumber: t.ItemNumber,
        TaxCodeID: Number(t.TaxCodeID),
        UnitPrice: t.UnitPrice,
        UnitCost: t.UnitCost,
        STS: t.STS,
        ItemType: t.ItemType,
        Brand: t.Brand,
        Barcode: t.Barcode,
        ReportCode: t.ReportCode,
        ImageFileName: t.ImageFileName,
        ImageFileData: t.ImageFileData,
        ManualPrice: typeof(t.ManualPrice) === 'boolean' ? t.ManualPrice : false,
        Discountable: typeof(t.Discountable) === 'boolean' ? t.Discountable : false,
        Inventory: typeof(t.Inventory) === 'boolean' ? t.Inventory : false,
        AvailableOnWeb: typeof(t.AvailableOnWeb) === 'boolean' ? t.AvailableOnWeb : false,
        BtlDepositInPrice: typeof(t.BtlDepositInPrice) === 'boolean' ? t.BtlDepositInPrice : false,
        BtlDepositInCost: typeof(t.BtlDepositInCost) === 'boolean' ? t.BtlDepositInCost : false,
        EcoFeeInPrice: typeof(t.EcoFeeInPrice) === 'boolean' ? t.EcoFeeInPrice : false,
        EcoFeeInCost: typeof(t.EcoFeeInCost) === 'boolean' ? t.EcoFeeInCost : false,
        //SdItemID: t.SdItemID,
        //LastAction: t.LastAction,
        //LastSendDate: t.LastSendDate,
        CreatedDate: new Date(), // t.CreatedDate,
        CreateUserID: loginUser?.UserID, //t.CreateUserID
      }));
      
      const result = await CreateVpItems(newItems);
      return result;          
      
    },
    //client side optimistic update
    onMutate: (newItemInfo: itemExt[]) => {
      queryClient.setQueryData(
        ['items'],
        (prevItems: any) =>
          [
            ...prevItems,
            {
              ...newItemInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as itemExt[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch Items after mutation, disabled for demo
  });
}

//READ hook (get items from api)
function useGetItems(store: Store | null, itemName: string, itemNumber: string) {
  return useQuery<itemExt[]>({
    queryKey: ['items'],
    queryFn: async () => {
      //send api request here

      const items = store ? await searchItems(store?.HeadOfficeToken, itemName, itemNumber) : [];
      const list = items.map((t) => ({
        ItemID: t.ItemID,
        DepartmentID: t.DepartmentID ? t.DepartmentID.toString() : '',
        CategoryID: t.CategoryID ? t.CategoryID.toString() : '',
        ItemName: t.ItemName,
        ItemDesc: t.ItemDesc,
        ItemNumber: t.ItemNumber,
        TaxCodeID: t.TaxCodeID ? t.TaxCodeID.toString() : '',
        UnitPrice: t.UnitPrice,
        UnitCost: t.UnitCost,
        STS: t.STS,
        ItemType: t.ItemType,
        Brand: t.Brand,
        BrandID: t.BrandID,
        Barcode: t.Barcode,
        ReportCode: t.ReportCode,
        ImageFileName: t.ImageFileName,
        ImageFileData: t.ImageFileData,
        ManualPrice: t.ManualPrice,
        Discountable: t.Discountable,
        Inventory: t.Inventory,
        AvailableOnWeb: t.AvailableOnWeb,
        BtlDepositInPrice: t.BtlDepositInPrice,
        BtlDepositInCost: t.BtlDepositInCost,
        EcoFeeInPrice: t.EcoFeeInPrice,
        EcoFeeInCost: t.EcoFeeInCost,
        SdItemID: t.SdItemID,
        LastAction: t.LastAction,
        LastStatus: t.LastStatus,
        LastSendDate: t.LastSendDate,
        CreatedDate: t.CreatedDate,
        CreateUserID: t.CreateUserID
      }));

      return list;
    },
    refetchOnWindowFocus: true,
  });
}

//UPDATE hook (put Items in api)
function useUpdateItems(selectedStore: Store | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (extItemList: item[]) => {
      //send api update request here
      const extItems: ExtItem = {
        PublicKey: selectedStore?.HeadOfficeToken ?? '',
        ExtItems: extItemList.map(extItem => ({      
          ItemID: extItem.ItemID,
          DepartmentID: Number(extItem.DepartmentID),
          CategoryID: Number(extItem.CategoryID),
          ItemName: extItem.ItemName,
          ItemDesc: extItem.ItemDesc,
          ItemNumber: extItem.ItemNumber,
          TaxCodeID: Number(extItem.TaxCodeID),
          UnitPrice: extItem.UnitPrice,
          UnitCost: extItem.UnitCost,
          STS: extItem.STS,
          ItemType: extItem.ItemType,
          Brand: extItem.Brand,
          Barcode: extItem.Barcode,
          ReportCode: extItem.ReportCode,
          ImageFileName: extItem.ImageFileName,
          ImageFileData: extItem.ImageFileData,
          ManualPrice: typeof(extItem.ManualPrice) === 'boolean' ? extItem.ManualPrice : false,
          Discountable: typeof(extItem.Discountable) === 'boolean' ? extItem.Discountable : false,
          Inventory: typeof(extItem.Inventory) === 'boolean' ? extItem.Inventory : false,
          AvailableOnWeb: typeof(extItem.AvailableOnWeb) === 'boolean' ? extItem.AvailableOnWeb : false,
          BtlDepositInPrice: typeof(extItem.BtlDepositInPrice) === 'boolean' ? extItem.BtlDepositInPrice : false,
          BtlDepositInCost: typeof(extItem.BtlDepositInCost) === 'boolean' ? extItem.BtlDepositInCost : false,
          EcoFeeInPrice: typeof(extItem.EcoFeeInPrice) === 'boolean' ? extItem.EcoFeeInPrice : false,
          EcoFeeInCost: typeof(extItem.EcoFeeInCost) === 'boolean' ? extItem.EcoFeeInCost : false,
          SdItemID: extItem.ItemID,
          LastAction: extItem.LastAction,        
          CreatedDate: new Date(), // extItem.CreatedDate,
          CreateUserID: extItem.CreateUserID,
          LastSendDate: extItem.LastSendDate ? new Date(extItem.LastSendDate) : undefined,
        })
      )};

      const resresponses: ExtItemResponse[] = await postItems(extItems);
      return resresponses;
    },
    //client side optimistic update
    onMutate: (newItems: itemExt[]) => {
      queryClient.setQueryData(
        ['items'],
        (prevItems: any) =>
          prevItems?.map((item: itemExt) => {
            const newItem = newItems.find((u) => u.ItemID === item.ItemID);
            return newItem ? newItem : item;
          }),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch Items after mutation, disabled for demo
  });
}

//DELETE hook (delete item in api)
function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      //send api delete request here      
      return await new Promise(async (resolve) => {        
        const result = await DeleteVpItem(Number(itemId));
        resolve(result);          
      });    
    },
    //client side optimistic update
    onMutate: (itemId: string) => {
      queryClient.setQueryData(
        ['items'],
        (prevItems: any) =>
          prevItems?.filter((item: itemExt) => item.ItemID !== Number(itemId)),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch Items after mutation, disabled for demo
  });
}

const validateRequired = (value: string | undefined) => !!value?.length;
const validateBarcodeDuplication = async (publicKey: string, barcode: string) => await barcodesDuplicationCheck(publicKey, barcode);
const validateItemNumberDuplication = async (publickey: string, itemNumber: string) => await itemNumberDuplicationCheck(publickey, itemNumber);

function validateItem(item: itemExt) {
  return {
    name: !validateRequired(item.ItemName)
      ? 'Item Name is Required'
      : '',    
    //email: !validateEmail(item.email) ? 'Incorrect Email Format' : '',
  };
}

export default SdItemMantineTable;