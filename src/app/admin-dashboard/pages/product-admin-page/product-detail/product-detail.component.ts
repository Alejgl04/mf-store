import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { firstValueFrom } from 'rxjs';
import { FormErrorLabelComponent } from '@shared/components/form-error-label/form-error-label.component';

import { FormUtils } from '@utils/form-utils';
import { ProductCarouselComponent } from '@products/components/product-carousel/product-carousel.component';
import { Product } from '@products/interfaces/product.interface';
import { ProductsService } from '@products/services/products.service';

@Component({
  selector: 'product-detail',
  imports: [ProductCarouselComponent, ReactiveFormsModule, FormErrorLabelComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {

  product = input.required<Product>();

  fb = inject(FormBuilder);
  router = inject(Router);

  productService = inject(ProductsService);
  wasSaved = signal(false);

  imageFileList: FileList | undefined = undefined;
  tempImages = signal<string[]>([]);

  imagesToCarosuel = computed(() => {
    const currentProductImages = [...this.product().images, ...this.tempImages()];

    return currentProductImages;
  })


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

  async onSubmit() {
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

    if ( this.product().id === 'new' ) {

      const product = await firstValueFrom(this.productService.createProduct(productLike, this.imageFileList));
      this.router.navigate(['/admin/product', product.id]);
    }
    else{
       await firstValueFrom(this.productService.updateProduct(this.product().id, productLike,  this.imageFileList));
    }

    this.wasSaved.set(true);
    setTimeout(() => {
      this.wasSaved.set(false);
    }, 3000);
  }

  onFilesChanged(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    this.imageFileList = fileList ?? undefined;

    const imageUrls = Array.from(fileList ?? []).map((file) =>
      URL.createObjectURL(file)
    );

    this.tempImages.set(imageUrls);
  }
}
