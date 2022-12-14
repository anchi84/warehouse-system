import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WAREHOUSE_SYSTEM_DATA, WAREHOUSE_SYSTEM_LAYOUT } from 'src/assets/data';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class WarehouseSystemService {
  getAllProducts(): Observable<Product[]> {
    return of(WAREHOUSE_SYSTEM_DATA);
  }

  getWarehoseSystemLayout(): Observable<any> {
    return of(WAREHOUSE_SYSTEM_LAYOUT);
  }

  addNewProduct(value: Product) {
    WAREHOUSE_SYSTEM_DATA.push(value);
  }

  updateProduct(value: Product, code: string) {
    const productToUpdateIndex = WAREHOUSE_SYSTEM_DATA.findIndex(el => el.code === code); 
    WAREHOUSE_SYSTEM_DATA[productToUpdateIndex] = value;
  }
}