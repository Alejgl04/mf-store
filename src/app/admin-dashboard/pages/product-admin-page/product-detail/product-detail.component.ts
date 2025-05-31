import { Component, input } from '@angular/core';
import { ProductCarouselComponent } from '@products/components/product-carousel/product-carousel.component';
import { Product } from '@products/interfaces/product.interface';

@Component({
  selector: 'product-detail',
  imports: [ProductCarouselComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent {

  product = input.required<Product>();

  sizes = ['XS', 'S', 'M', 'L', 'XL']

}
