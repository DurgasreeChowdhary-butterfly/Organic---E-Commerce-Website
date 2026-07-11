import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as productService from "@/services/productService";
import * as adminService from "@/services/adminService";
import type { DummyProduct } from "@/data/products";
import type { Category } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface ProductsState {
  // customer listing (ProductListingPage)
  items: DummyProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  listStatus: AsyncStatus;
  listError: string | null;

  // categories (Header, Footer, HomePage, ProductFilters)
  categories: Category[];
  categoriesStatus: AsyncStatus;

  // product detail page
  currentProduct: DummyProduct | null;
  relatedProducts: DummyProduct[];
  detailStatus: AsyncStatus;
  detailError: string | null;

  // home page sections
  featured: DummyProduct[];
  latest: DummyProduct[];
  homeStatus: AsyncStatus;

  // search results page
  searchResults: DummyProduct[];
  searchTotal: number;
  searchStatus: AsyncStatus;

  // admin product table
  adminItems: DummyProduct[];
  adminTotal: number;
  adminPage: number;
  adminPageSize: number;
  adminTotalPages: number;
  adminStatus: AsyncStatus;
  adminError: string | null;

  // admin category grid
  adminCategories: Category[];
  adminCategoriesStatus: AsyncStatus;
  adminCategoryError: string | null;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 1,
  listStatus: "idle",
  listError: null,

  categories: [],
  categoriesStatus: "idle",

  currentProduct: null,
  relatedProducts: [],
  detailStatus: "idle",
  detailError: null,

  featured: [],
  latest: [],
  homeStatus: "idle",

  searchResults: [],
  searchTotal: 0,
  searchStatus: "idle",

  adminItems: [],
  adminTotal: 0,
  adminPage: 1,
  adminPageSize: 10,
  adminTotalPages: 1,
  adminStatus: "idle",
  adminError: null,

  adminCategories: [],
  adminCategoriesStatus: "idle",
  adminCategoryError: null,
};

// ---------- Customer thunks ----------

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchProducts",
  async (params: productService.ProductListParams, { rejectWithValue }) => {
    try {
      return await productService.getProducts(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load products"));
    }
  }
);

export const fetchCategoriesThunk = createAsyncThunk("products/fetchCategories", async () => {
  return productService.getCategories();
});

export const fetchProductBySlugThunk = createAsyncThunk(
  "products/fetchProductBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const product = await productService.getProductBySlug(slug);
      const related = await productService.getRelatedProducts(slug);
      return { product, related };
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Product not found"));
    }
  }
);

export const fetchHomeProductsThunk = createAsyncThunk("products/fetchHomeProducts", async () => {
  const [featured, latest] = await Promise.all([
    productService.getFeaturedProducts(8),
    productService.getLatestProducts(8),
  ]);
  return { featured, latest };
});

export const searchProductsThunk = createAsyncThunk(
  "products/search",
  async ({ q, page = 1 }: { q: string; page?: number }) => {
    return productService.searchProducts(q, page);
  }
);

// ---------- Admin thunks ----------

export const adminFetchProductsThunk = createAsyncThunk(
  "products/adminFetchProducts",
  async (params: adminService.AdminProductListParams, { rejectWithValue }) => {
    try {
      return await adminService.adminListProducts(params);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not load products"));
    }
  }
);

export const adminCreateProductThunk = createAsyncThunk(
  "products/adminCreateProduct",
  async (payload: adminService.AdminProductInput, { rejectWithValue }) => {
    try {
      return await adminService.adminCreateProduct(payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not create product"));
    }
  }
);

export const adminUpdateProductThunk = createAsyncThunk(
  "products/adminUpdateProduct",
  async ({ id, payload }: { id: string; payload: Partial<adminService.AdminProductInput> }, { rejectWithValue }) => {
    try {
      return await adminService.adminUpdateProduct(id, payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update product"));
    }
  }
);

export const adminDeleteProductThunk = createAsyncThunk(
  "products/adminDeleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminService.adminDeleteProduct(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not delete product"));
    }
  }
);

export const adminFetchCategoriesThunk = createAsyncThunk("products/adminFetchCategories", async () => {
  return adminService.adminListCategories();
});

export const adminCreateCategoryThunk = createAsyncThunk(
  "products/adminCreateCategory",
  async (payload: adminService.AdminCategoryInput, { rejectWithValue }) => {
    try {
      return await adminService.adminCreateCategory(payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not create category"));
    }
  }
);

export const adminUpdateCategoryThunk = createAsyncThunk(
  "products/adminUpdateCategory",
  async ({ id, payload }: { id: string; payload: Partial<adminService.AdminCategoryInput> }, { rejectWithValue }) => {
    try {
      return await adminService.adminUpdateCategory(id, payload);
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not update category"));
    }
  }
);

export const adminDeleteCategoryThunk = createAsyncThunk(
  "products/adminDeleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminService.adminDeleteCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not delete category"));
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductsError(state) {
      state.listError = null;
      state.detailError = null;
      state.adminError = null;
      state.adminCategoryError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchProductsThunk.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.page_size;
        state.totalPages = action.payload.total_pages;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.listStatus = "error";
        state.listError = (action.payload as string) ?? "Could not load products";
      })

      // categories
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.categoriesStatus = "loading";
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, (state) => {
        state.categoriesStatus = "error";
      })

      // detail
      .addCase(fetchProductBySlugThunk.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
        state.currentProduct = null;
      })
      .addCase(fetchProductBySlugThunk.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.currentProduct = action.payload.product;
        state.relatedProducts = action.payload.related;
      })
      .addCase(fetchProductBySlugThunk.rejected, (state, action) => {
        state.detailStatus = "error";
        state.detailError = (action.payload as string) ?? "Product not found";
      })

      // home
      .addCase(fetchHomeProductsThunk.pending, (state) => {
        state.homeStatus = "loading";
      })
      .addCase(fetchHomeProductsThunk.fulfilled, (state, action) => {
        state.homeStatus = "succeeded";
        state.featured = action.payload.featured;
        state.latest = action.payload.latest;
      })
      .addCase(fetchHomeProductsThunk.rejected, (state) => {
        state.homeStatus = "error";
      })

      // search
      .addCase(searchProductsThunk.pending, (state) => {
        state.searchStatus = "loading";
      })
      .addCase(searchProductsThunk.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        state.searchResults = action.payload.items;
        state.searchTotal = action.payload.total;
      })
      .addCase(searchProductsThunk.rejected, (state) => {
        state.searchStatus = "error";
      })

      // admin products
      .addCase(adminFetchProductsThunk.pending, (state) => {
        state.adminStatus = "loading";
        state.adminError = null;
      })
      .addCase(adminFetchProductsThunk.fulfilled, (state, action) => {
        state.adminStatus = "succeeded";
        state.adminItems = action.payload.items;
        state.adminTotal = action.payload.total;
        state.adminPage = action.payload.page;
        state.adminPageSize = action.payload.page_size;
        state.adminTotalPages = action.payload.total_pages;
      })
      .addCase(adminFetchProductsThunk.rejected, (state, action) => {
        state.adminStatus = "error";
        state.adminError = (action.payload as string) ?? "Could not load products";
      })
      .addCase(adminCreateProductThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not create product";
      })
      .addCase(adminUpdateProductThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not update product";
      })
      .addCase(adminDeleteProductThunk.fulfilled, (state, action) => {
        state.adminItems = state.adminItems.filter((p) => p.id !== action.payload);
        state.adminTotal = Math.max(0, state.adminTotal - 1);
      })
      .addCase(adminDeleteProductThunk.rejected, (state, action) => {
        state.adminError = (action.payload as string) ?? "Could not delete product";
      })

      // admin categories
      .addCase(adminFetchCategoriesThunk.pending, (state) => {
        state.adminCategoriesStatus = "loading";
      })
      .addCase(adminFetchCategoriesThunk.fulfilled, (state, action) => {
        state.adminCategoriesStatus = "succeeded";
        state.adminCategories = action.payload;
      })
      .addCase(adminFetchCategoriesThunk.rejected, (state) => {
        state.adminCategoriesStatus = "error";
      })
      .addCase(adminCreateCategoryThunk.rejected, (state, action) => {
        state.adminCategoryError = (action.payload as string) ?? "Could not create category";
      })
      .addCase(adminUpdateCategoryThunk.rejected, (state, action) => {
        state.adminCategoryError = (action.payload as string) ?? "Could not update category";
      })
      .addCase(adminDeleteCategoryThunk.fulfilled, (state, action) => {
        state.adminCategories = state.adminCategories.filter((c) => c.id !== action.payload);
      })
      .addCase(adminDeleteCategoryThunk.rejected, (state, action) => {
        state.adminCategoryError = (action.payload as string) ?? "Could not delete category";
      });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
