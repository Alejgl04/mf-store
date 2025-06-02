import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, of, tap } from 'rxjs';

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

  private productsCache = new Map<string,ProductsResponse>();
  private productByIdCache = new Map<string,Product>();

  getProducts(options: Options): Observable<ProductsResponse> {

    const { limit = 12, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`;

    if ( this.productsCache.has(key)){
      return of(this.productsCache.get(key)!);
    }

    return this.http.get<ProductsResponse>(`${baseURL}/products`, {
      params: {
        limit,
        offset,
        gender,
      }
    }).pipe(
      tap(( resp ) => console.log(resp)),
      tap(( resp ) => this.productsCache.set(key, resp))
    )
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {

    if ( this.productByIdCache.has(idSlug)) {
      return of( this.productByIdCache.get(idSlug)!);
    }

    return this.http.get<Product>(`${baseURL}/products/${idSlug}`).pipe(
      tap(( product ) => this.productByIdCache.set(idSlug,product))
    )
  }
  getProductById(id: string): Observable<Product> {

    if ( this.productByIdCache.has(id)) {
      return of( this.productByIdCache.get(id)!);
    }

    return this.http.get<Product>(`${baseURL}/products/${id}`).pipe(
      tap(( product ) => this.productByIdCache.set(id,product))
    )
  }

  updateProduct(id: string, productLike: Partial<Product>): Observable<Product> {

    return this.http.patch<Product>(`${baseURL}/products/${id}`, productLike).pipe(
      tap((product) => {
        this.updateProductCatch(product)
      })
    )

  }

  updateProductCatch(product: Product) {
    const productId = product.id;

    this.productByIdCache.set(productId, product);

    this.productsCache.forEach(( productResponse ) => {

      productResponse.products = productResponse.products.map(( currentProduct ) => {

        return currentProduct.id === productId ? product : currentProduct

      });

    });

  }

}
