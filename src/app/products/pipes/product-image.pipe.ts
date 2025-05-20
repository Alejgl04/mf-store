import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '@environments/environment';

const baseURL = environment.baseUrl;

@Pipe({
  name: 'productImage'
})

export class productImage implements PipeTransform {
  transform(value: string | string[]): string {

    if ( typeof value === 'string' ) {
      return `${baseURL}/files/product/${value}`;
    }

    const image = value.at(0);

    if ( !image ) {

      return './assets/images/no-image.jpg';

    }

    return `${baseURL}/files/product/${image}`;
  }
}
