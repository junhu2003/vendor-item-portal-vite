import { Store } from '../vpadmin/vpAdminTypes';

export interface MainLayoutProps {
  changeSelectedStore: (selectedStore: Store) => void;
}