import Admin from "./admin";
import { Product } from "./products";
import { Inventory } from "./inventory";
import { Purchase } from "./purchases";
import { Supplier } from "./suppliers";
import { Customer } from "./customers";
import Helper from "./helper";
import { Category } from "./categories";
import { Sales } from "./sales";

const api = {
  Admin,
  Product,
  Category,
  Inventory,
  Purchase,
  Supplier,
  Customer,
  Sales,
  Helper
};

export default api;
