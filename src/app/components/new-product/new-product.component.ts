import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { WarehouseSystemService } from 'src/app/services/warehouse-system.service';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'new-product',
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent implements OnInit {
  @Input() allProducts: Product[];
  @Input() warehouseLayout: any;
  @Input() availableFloors: number[];
  availableSections: number[] = [];
  productForm: FormGroup;
  title: string = 'Add new product';
  editMode: boolean = false;
  showFloorsMenu: boolean = false;
  showSectionsMenu: boolean = false;
  @Output() productModalCloseEmit: EventEmitter<any> = new EventEmitter();

  constructor(
    public warehouseSystemService: WarehouseSystemService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.productForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z]{2,4} \d{4,6}$/)], this.codeIsNotAvailable.bind(this)],
      quantity: [null, [Validators.required, Validators.pattern(/^[1-9]\d*$/)]],
      floor: [null, Validators.required],
      section: [null, Validators.required]
    })
  }

  openProductModal(product?: Product) {
    if (product) {
      this.title = 'Edit product';
      this.editMode = true;
      this.availableSections = this.warehouseLayout.find((el: any) => el.floor === product.floor)?.sections || [];
      this.productForm.patchValue(product);
      this.productForm.get('code')?.disable();
    }
    document.body.classList.add('modal-open');
  }
  
  saveProduct() {
    if (this.productForm.valid) {
      const codeControl = this.productForm.get('code');
      const product = {
        code: codeControl?.value,
        quantity: Number(this.productForm.get('quantity')?.value),
        floor: Number(this.productForm.get('floor')?.value),
        section: Number(this.productForm.get('section')?.value)
      }
      if (this.editMode) {
        codeControl?.enable();
        this.warehouseSystemService.updateProduct(product, codeControl?.value);
      } else {
        this.warehouseSystemService.addNewProduct(product);
      }
      this.closeProductModal();
    } else {
        return;
    }
  }

  closeProductModal() {
    document.body.classList.remove('modal-open');
    this.productModalCloseEmit.emit();
  }

  selectFloor(floor: number) {
    this.productForm.get('floor')?.setValue(floor);
    this.productForm.get('section')?.setValue(null);
    this.showFloorsMenu = false;
    this.availableSections = this.warehouseLayout.find((el: any) => el.floor === floor)?.sections || [];
  }

  selectSection(section: number) {
    this.productForm.get('section')?.setValue(section);
    this.showSectionsMenu = false;
  }

  codeIsNotAvailable(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      setTimeout(() => {
        if(this.allProducts.find(el => el.code === control.value)) {
          resolve({'codeIsNotAvailable': true})
        } else {
          resolve(null)
        }
      }, 500);
    });
    return promise;
  }

  showValidationMessage(controlName: string): any {
    let control = this.productForm.controls[controlName];
    return control && (control.dirty || control.touched) && control.invalid;
  }
}

