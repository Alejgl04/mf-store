import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

import { Gender, Product, ProductsResponse } from '@products/interfaces/product.interface';
import { environment } from '@environments/environment';
import { User } from '@auth/interfaces/user.interface';

const baseURL = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User
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

    if ( id === 'new' ) {
      return of(emptyProduct);
    }

    if ( this.productByIdCache.has(id)) {
      return of( this.productByIdCache.get(id)!);
    }

    return this.http.get<Product>(`${baseURL}/products/${id}`).pipe(
      tap(( product ) => this.productByIdCache.set(id,product))
    )
  }

  updateProduct(id: string, productLike: Partial<Product>, imageFileList? : FileList): Observable<Product> {

    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList)
      .pipe(
        map( imagesName => ({
          ...productLike,
          images: [...currentImages, ...imagesName]
        })),
        switchMap((updatedProduct) =>
        this.http.patch<Product>(`${baseURL}/products/${id}`, updatedProduct)
        ),
        tap((product) => {
          this.updateProductCatch(product)
        })
      )
  }

  createProduct(productLike: Partial<Product>, imageFileList? : FileList): Observable<Product> {
    return this.http.post<Product>(`${baseURL}/products`, productLike).pipe(
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

  uploadImages( images? : FileList ): Observable<string[]> {
    if ( !images ) return of([]);

    const uploadObservables = Array.from(images).map((imageFile) =>
      this.uploadImage(imageFile),
    )

    return forkJoin(uploadObservables);

  }

  uploadImage( imageFile : File ): Observable<string> {

    const formData = new FormData();

    formData.append('file', imageFile);

    return this.http.post<{fileName: string }>(`${baseURL}/files/product`, formData).pipe(
      map( resp => resp.fileName)
    )

  }

}
