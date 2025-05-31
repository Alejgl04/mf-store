import { Routes } from "@angular/router";
import { AdminDashboardLayoutComponent } from "./layout/admin-dashboard-layout/admin-dashboard-layout.component";

import { ProductAdminPageComponent } from "./pages/product-admin-page/product-admin-page.component";
import { ProductsAdminPageComponent } from "./pages/products-admin-page/products-admin-page.component";
import { isAdminGuard } from "@auth/guards/is-admin.guard";
import { ProfileAdminPageComponent } from "./pages/profile-admin-page/profile-admin-page.component";

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    canMatch: [
      isAdminGuard
    ],
    children: [
      {
        path: 'products',
        component: ProductsAdminPageComponent
      },
      {
        path: 'product/:id',
        component: ProductAdminPageComponent,
      },
      {
        path: 'profile',
        component: ProfileAdminPageComponent,
      },
      {
        path: '**',
        redirectTo: 'products',
      },
    ]
  }
]

export default adminDashboardRoutes;
