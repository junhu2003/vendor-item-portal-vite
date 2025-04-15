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
import { ActionIcon, Button, Text, Tooltip, FileInput, MultiSelect, Switch, Autocomplete } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconSend, IconFileImport, IconInfoCircle } from '@tabler/icons-react';
import {  
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { DeptCategories, ExtItemResponse } from '../types/sditem/sdItemTypes'; 
import { item, ExtItem, SendItemHistory, Store, Users } from '../types/vpadmin/vpAdminTypes';
import {
  getDeptLabels, 
  getCategoryLabels, 
  getTaxCodeLabels, 
  getBrandLabels,
  getReportCodeLabels,
  getItemTypeLabels,
  getItemStatusLabels,
} from '../api/sd-item-api-helper';

import {
  barcodesDuplicationCheck,
  itemNumberDuplicationCheck,
  postItems,
} from '../api/sd-item-api';

import { 
  GetMyVpUsers,
  GetVpItems,
  CreateVpItems,
  UpdateVpItems,
  DeleteVpItem, 
  GetLastSendItemHistory, 
} from '../api/vp-item-api';
import { useAuth } from '../context/AuthContext';
//import Toast from './Toast';
import { showNotification } from '@mantine/notifications';


const VpItemMantineTable: React.FC<{selectedStore: Store | null}> = ({selectedStore}) => {
  const { loginUser } = useAuth();  

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  //const [toast, setToast] = useState<React.ReactElement | null>(null);
  const [lastSendItemHistory, setLastSendItemHistory] = useState<SendItemHistory | null>(null);
  //const [currentToken, setCurrentToken] = useState('');

  //keep track of rows that have been edited  
  const [editedItems, setEditedItems] = useState<Record<string, item>>({});  

  const [depts, setDepts] = useState<{ label: string, value: string }[]>([]);
  const [deptCategories, setDeptCategories] = useState<DeptCategories[]>([]);
  const [taxCodes, setTaxCodes] = useState<{ label: string, value: string }[]>([]);
  const [brands, setBrands] = useState<{ label: string, value: string }[]>([]); 
  const [rptCodes, setRptCodes] = useState<{ label: string, value: string }[]>([]); 
  const [itemTypes, setItemTypes] = useState<{ label: string, value: string }[]>([]);
  const [itemStatuses, setItemStatuses] = useState<{ label: string, value: string }[]>([]);

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
  
  const isSwitched = (cell: MRT_Cell<item, unknown>, key: string, row: MRT_Row<item>): Boolean => {
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
  
  const handleFileChange = async (file: File | null, row: MRT_Row<item>) => {    
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

  const getLastSendingHistory = async (itemID: number) => {
    const res = await GetLastSendItemHistory(itemID);
    setLastSendItemHistory(res);
  }

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
    queryClient.invalidateQueries({ queryKey: ['items'] });
  }, [selectedStore]);

  //call CREATE hook
  const { mutateAsync: createItem, isPending: isCreatingItem } =
    useCreateItem(loginUser);
  //call READ hook
  const {
    data: fetchedItems = [],
    isError: isLoadingItemsError,
    isFetching: isFetchingItems,
    isLoading: isLoadingItems,
  } = useGetItems(selectedStore, loginUser);
  //call UPDATE hook
  const { mutateAsync: updateItems, isPending: isUpdatingItem } =
    useUpdateItems();
  //call DELETE hook
  const { mutateAsync: deleteItem, isPending: isDeletingItem } =
    useDeleteItem();

  //CREATE action
  const handleCreateItem: MRT_TableOptions<item>['onCreatingRowSave'] = async ({
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

  // Send multiple itemsto SD action
  const handleSendItems = async () => {
    
    const itemsToSend = table.getSelectedRowModel().rows.map((row) => {
      return row.original;
    });

    if (itemsToSend.length > 0) {
      await sendItemsToSD(itemsToSend);
    }
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<item>) =>
    modals.openConfirmModal({
      title: 'DELETE item',
      children: (
        <Text>
          Are you sure you want to delete {row.original.ItemName}{' '}?
           This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteItem(row.original.ItemID.toString()),
    });

//SEND to SD action
const openSendToSDConfirmModal = (row: MRT_Row<item>) =>
  modals.openConfirmModal({
    title: 'SEND item TO SD',
    children: (
      <Text>
        Are you sure you want to send {row.original.ItemName} to SD?        
      </Text>
    ),
    labels: { confirm: 'Send', cancel: 'Cancel' },
    confirmProps: { color: 'green' },
    onConfirm: () => sendItemsToSD([row.original]),
  });

  const sendItemsToSD = async (extItemList: item[], isNotified: boolean = true) => {

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
        Discountable: typeof(extItem.Discountable) === 'boolean' ? extItem.ManualPrice : false,
        Inventory: typeof(extItem.Inventory) === 'boolean' ? extItem.Inventory : false,
        AvailableOnWeb: typeof(extItem.AvailableOnWeb) === 'boolean' ? extItem.AvailableOnWeb : false,
        BtlDepositInPrice: typeof(extItem.BtlDepositInPrice) === 'boolean' ? extItem.BtlDepositInPrice : false,
        BtlDepositInCost: typeof(extItem.BtlDepositInCost) === 'boolean' ? extItem.BtlDepositInCost : false,
        EcoFeeInPrice: typeof(extItem.EcoFeeInPrice) === 'boolean' ? extItem.EcoFeeInPrice : false,
        EcoFeeInCost: typeof(extItem.EcoFeeInCost) === 'boolean' ? extItem.EcoFeeInCost : false,
        SdItemID: extItem.SdItemID,
        LastAction: extItem.LastAction,        
        CreatedDate: new Date(), // extItem.CreatedDate,
        CreateUserID: extItem.CreateUserID,
        LastSendDate: extItem.LastSendDate ? new Date(extItem.LastSendDate) : undefined,
      })
    )};
    const resresponses: ExtItemResponse[] = await postItems(extItems);

    // refresh UI
    await queryClient.invalidateQueries({ queryKey: ['items'] })

    if (isNotified) {
      resresponses.forEach(res => {
        // use toast instead of notification
        /*       
        const status: "success" | "error" | "warning" | "info" = res.Status === 'Successed' ? 'success' : 'error';
  
        setToast(
          <Toast 
            message={ res.Message }
            type={ status } 
            duration={3000} 
            onClose={() => setToast(null)} 
          />
        );*/  

        // use notification instead of toast        
        showNotification({
          //title: 'Items sent to SD',
          message: res.Message,
          color: res.Status === 'Successed' ? 'green' : 'red',
          autoClose: 3000,
          styles: ({
            root: {
              fontSize: 18,
              padding: 12,
              maxWidth: '600px',
              backgroundColor: '#d1d5db', // Tailwind "gray-100"
              color: '#111827', // Tailwind "gray-900"              
            },            
          }),
        });
      });
    }    
  }

  const columns = useMemo<MRT_ColumnDef<item>[]>(    
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
        }),
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
              size='xs'
            />
          );
        },        
      },      
    ],
    [editedItems, validationErrors, depts, deptCategories, taxCodes, brands, rptCodes, 
      itemTypes, itemStatuses, selectedStore],
  );

  const table = useMantineReactTable({    
    columns,
    data: fetchedItems,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also available)
    enableEditing: true,
    enableRowActions: true,  
    enableRowSelection: true,    
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
      <div className='flex items-centers space-x-1' style={{ width: '300px' }}>
        <Tooltip label={(row.original.SdItemID ? ('SD Item No. ' + row.original.SdItemID) : '') + (row.original.LastSendDate ? ( ' ' + (row.original.LastAction ?? '') + ' ' + (row.original.LastStatus ?? '') + ' on ' +  row.original.LastSendDate?.toLocaleString()) : 'Send to SD')}>
          <ActionIcon style={{background: 'transparent'}} onClick={() => openSendToSDConfirmModal(row)}>
            <IconSend color={ row.original.LastStatus === 'Successed' ? 'blue' : (row.original.LastStatus === 'Failed' ? 'orange' : 'green')} />
          </ActionIcon>
        </Tooltip>        
        <Tooltip label={ lastSendItemHistory ? lastSendItemHistory.ResponseMsg : ''}>
          <ActionIcon style={{background: 'transparent'}} onMouseEnter={() => getLastSendingHistory(Number(row.original.ItemID))} onMouseLeave={() => setLastSendItemHistory(null)}>
            <IconInfoCircle color='purple' />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon style={{background: 'transparent'}} onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash color='red' />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
    displayColumnDefOptions:{
      'mrt-row-actions': {
        size: 100, // 👈 try 120–140px for 3 buttons
        maxSize: 130,
        minSize: 90,
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
          Save items to Local
        </Button>
        <Button
          color="blue"
          onClick={handleSendItems}
          disabled={
            Object.keys(table.getSelectedRowModel().rows).length === 0 ||
            Object.values(validationErrors).some((error) => !!error)
          }
          loading={isUpdatingItem}
        >
          Send items to SD
        </Button>
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New item
      </Button>
    ),    
    state: {
      isLoading: isLoadingItems,
      isSaving: isCreatingItem || isUpdatingItem || isDeletingItem,
      showAlertBanner: isLoadingItemsError,
      showProgressBars: isFetchingItems,
    },
  });

  return (
  <div>
    {/*toast*/}
    { selectedStore && selectedStore.HeadOfficeToken.length > 0 
      && <MantineReactTable table={table} /> }
    
  </div>    
);
};

//CREATE hook (post new item to api)
function useCreateItem(loginUser: Users | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: item[]) => {
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
        BrandID: t.Brand,
        Barcode: t.Barcode,
        ReportCode: t.ReportCode,
        ImageFileName: t.ImageFileName,
        ImageFileData: t.ImageFileData,
        ManualPrice: typeof(t.ManualPrice) === 'boolean' ? t.ManualPrice : false,
        Discountable: typeof(t.Discountable) === 'boolean' ? t.ManualPrice : false,
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
    onMutate: (newItemInfo: item[]) => {
      queryClient.setQueryData(
        ['items'],
        (prevItems: any) =>
          [
            ...prevItems,
            {
              ...newItemInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as item[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch Items after mutation, disabled for demo
  });
}

//READ hook (get items from api)
function useGetItems(store: Store | null, loginUser: Users | null) {
  return useQuery<item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      //send api request here
      let userIds = '';
      if (loginUser?.UserLevelID.toString() === '2') {
        const userList = loginUser && loginUser.UserID ? 
          await GetMyVpUsers(loginUser.UserID.toString()) : [];
        userIds = userList.map((u) => u.UserID).join(',');
      } else if (loginUser && loginUser.UserLevelID.toString() === '3') {
        userIds = loginUser.UserID?.toString() ?? '';
      }

      const items = store ? await GetVpItems(store?.HeadOfficeToken, userIds) : [];
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
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Items in api)
function useUpdateItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: item[]) => {
      //send api update request here
      const result = await UpdateVpItems(items);
      return result;
    },
    //client side optimistic update
    onMutate: (newItems: item[]) => {
      queryClient.setQueryData(
        ['items'],
        (prevItems: any) =>
          prevItems?.map((item: item) => {
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
          prevItems?.filter((item: item) => item.ItemID !== Number(itemId)),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch Items after mutation, disabled for demo
  });
}

const validateRequired = (value: string | undefined) => !!value?.length;
const validateBarcodeDuplication = async (publicKey: string, barcode: string) => await barcodesDuplicationCheck(publicKey, barcode);
const validateItemNumberDuplication = async (publickey: string, itemNumber: string) => await itemNumberDuplicationCheck(publickey, itemNumber);

function validateItem(item: item) {
  return {
    name: !validateRequired(item.ItemName)
      ? 'Item Name is Required'
      : '',    
    //email: !validateEmail(item.email) ? 'Incorrect Email Format' : '',
  };
}

export default VpItemMantineTable;