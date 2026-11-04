export interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  _count?: { products: number };
}

export interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export const emptySupplierForm: SupplierForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};
