import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductCarouselComponent } from '@products/components/product-carousel/product-carousel.component';
import { Product } from '@products/interfaces/product.interface';
import { FormUtils } from '@utils/form-utils';
import { FormErrorLabelComponent } from "../../../../shared/components/form-error-label/form-error-label.component";
import { ProductsService } from '@products/services/products.service';

@Component({
  selector: 'product-detail',
  imports: [ProductCarouselComponent, ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {

  product = input.required<Product>();

  fb = inject(FormBuilder);
  productService = inject(ProductsService);

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [[]],
    tags: [''],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]]
  })

  sizes = ['XS', 'S', 'M', 'L', 'XL'];


  ngOnInit(): void {
    this.setFormValue(this.product())
  }

  setFormValue( formLike: Partial<Product>) {
    this.productForm.reset(formLike as any)
    this.productForm.patchValue({ tags: formLike.tags?.join(',') })
  }

  onSizesClicked( size: string ) {
    const currentSizes = this.productForm.value.sizes ?? [];

    if ( currentSizes.includes(size) ) {
      currentSizes.splice(currentSizes.indexOf(size), 1);
    }
    else {
      currentSizes.push(size);
    }

    this.productForm.patchValue({sizes: currentSizes});
  }

  onSubmit() {
    const isValid = this.productForm.valid;
    const formValue = this.productForm.value;
    this.productForm.markAllAsTouched();

    if (!isValid) return;

    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags: formValue.tags
        ?.toLowerCase()
        .split(',')
        .map((tag) => tag.trim()) ?? [],
    };

    this.productService.updateProduct(this.product().id, productLike).subscribe(
      product => {
        console.log('update product');
      }
    )
  }

}
