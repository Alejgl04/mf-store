import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { Product, ProductsResponse } from '@products/interfaces/product.interface';
import { environment } from '@environments/environment';

const baseURL = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

@Injectable({providedIn: 'root'})
export class ProductsService {

  private http = inject(HttpClient);

  getProducts(options: Options): Observable<ProductsResponse> {

    const { limit = 9, offset = 0, gender = '' } = options;

    return this.http.get<ProductsResponse>(`${baseURL}/products`, {
      params: {
        limit,
        offset,
        gender,
      }
    })
    .pipe(
      tap( resp => console.log(resp)),
    )
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    return this.http.get<Product>(`${baseURL}/products/${idSlug}`)
  }
}
