import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { WarehouseSystemService } from 'src/app/services/warehouse-system.service';
import { Product } from '../../models/product.model';
import { NewProductComponent } from '../new-product/new-product.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  allProducts: Product[] = [];
  products: Product[] = [];
  warehouseLayout: any;
  availableFloors: number[] = []
  availableSections: number[] = []
  selectedFloor: number | null = null;
  selectedSection: number | null = null;
  showProductModal: boolean = false;
  searchInput: string = '';
  showFloorsMenu: boolean = true;
  showSectionsMenu: boolean = true;
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('newProductComponent') private newProductComponent: NewProductComponent

  constructor(
    public warehouseSystemService: WarehouseSystemService
  ) { }

  ngOnInit(): void {
    combineLatest([
      this.warehouseSystemService.getAllProducts(),
      this.warehouseSystemService.getWarehoseSystemLayout(),
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      ([res1, res2]) => {
        this.allProducts = res1;
        this.warehouseLayout = res2;
        this.warehouseLayout.forEach((el: { floor: number; }) => {
          this.availableFloors.push(el.floor);
        });
        this.selectedFloor = this.availableFloors[0];
        this.getAvailableSections();
        this.selectedSection = this.availableSections[0];
        this.setProductsByFloorAndSection();
      }
    );
  }

  getAvailableSections() {
    this.availableSections = this.warehouseLayout.find((el: any) => el.floor === this.selectedFloor)?.sections || [];
  }

  setProductsByFloorAndSection() {
    if (this.selectedFloor && this.selectedSection) {
      this.products = this.allProducts.filter(el => el.floor === this.selectedFloor && el.section === this.selectedSection);
    }
  }

  selectFloor(floor: number) {
    this.searchInput = '';
    this.selectedFloor = floor;
    this.getAvailableSections();
    this.selectedSection = this.availableSections[0];
    this.setProductsByFloorAndSection();
  }

  selectSection(section: number) {
    this.searchInput = '';
    this.selectedSection = section;
    this.setProductsByFloorAndSection();
  }

  onSearch() {
    this.selectedFloor = null;
    this.selectedSection = null;
    this.availableSections = [];
    if (this.searchInput !== '') {
      this.products = this.allProducts.filter(el => el.code.includes(this.searchInput) || el.floor.toString().includes(this.searchInput) || el.section.toString().includes(this.searchInput))
    }
  }

  productModalOpen(product?: Product): void {
    this.showProductModal = true;
    setTimeout(() => {
      this.newProductComponent.openProductModal(product);
    }, 0);
  }

  productModalClose() {
    this.showProductModal = false;
    if (this.searchInput !== '') {
      this.products = this.allProducts.filter(el => el.code.includes(this.searchInput) || el.floor.toString().includes(this.searchInput) || el.section.toString().includes(this.searchInput))
    } else {
      this.setProductsByFloorAndSection();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

