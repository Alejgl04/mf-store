import { AfterViewInit, Component, ElementRef, input, viewChild } from '@angular/core';
import { Navigation, Pagination } from 'swiper/modules';

import { productImage } from '@products/pipes/product-image.pipe';
import Swiper from 'swiper';
// import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

@Component({
  selector: 'product-carousel',
  imports: [productImage],
  templateUrl: './product-carousel.component.html',
  styles: `
    .swiper {
      width: 100%;
      height: 500px;
    }
  `,
})
export class ProductCarouselComponent implements AfterViewInit {

  images = input.required<string[]>();
  swiperContainer = viewChild.required<ElementRef>('swiperContainer');

  ngAfterViewInit(): void {
    const element = this.swiperContainer().nativeElement;

    if (!element) return;

    const swiper = new Swiper(element, {
    // Optional parameters
      direction: 'horizontal',
      loop: true,

      modules: [
        Navigation, Pagination
      ],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },

      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });

  }
}
