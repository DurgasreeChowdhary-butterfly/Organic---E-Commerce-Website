import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import * as addressService from "@/services/addressService";
import type { Address } from "@/types";

function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((d) => (d && typeof d === "object" && typeof (d as { msg?: unknown }).msg === "string" ? (d as { msg: string }).msg : null))
        .filter((m): m is string => !!m);
      if (messages.length) return messages.join("; ");
    }
  }
  return fallback;
}

type AsyncStatus = "idle" | "loading" | "succeeded" | "error";

export interface AddressesState {
  items: Address[];
  status: AsyncStatus;
  error: string | null;
  /** Address id currently being deleted/set-default — drives per-card loading state. */
  mutatingId: string | null;
}

const initialState: AddressesState = {
  items: [],
  status: "idle",
  error: null,
  mutatingId: null,
};

// Every mutation re-fetches the full list afterward rather than reconciling
// default-address exclusivity locally — the backend is the sole source of
// truth for which address is default, and duplicating that logic
// client-side is an easy way to drift out of sync with it.

export const fetchAddressesThunk = createAsyncThunk("addresses/fetch", async (_: void, { rejectWithValue }) => {
  try {
    return await addressService.getAddresses();
  } catch (err) {
    return rejectWithValue(apiErrorMessage(err, "Could not load your addresses"));
  }
});

export const createAddressThunk = createAsyncThunk(
  "addresses/create",
  async (payload: addressService.AddressPayload, { rejectWithValue }) => {
    try {
      await addressService.createAddress(payload);
      return await addressService.getAddresses();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not save this address"));
    }
  }
);

export const updateAddressThunk = createAsyncThunk(
  "addresses/update",
  async ({ id, payload }: { id: string; payload: addressService.AddressUpdatePayload }, { rejectWithValue }) => {
    try {
      await addressService.updateAddress(id, payload);
      return await addressService.getAddresses();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not save this address"));
    }
  }
);

export const deleteAddressThunk = createAsyncThunk(
  "addresses/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await addressService.deleteAddress(id);
      return await addressService.getAddresses();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not delete this address"));
    }
  }
);

export const setDefaultAddressThunk = createAsyncThunk(
  "addresses/setDefault",
  async (id: string, { rejectWithValue }) => {
    try {
      await addressService.setDefaultAddress(id);
      return await addressService.getAddresses();
    } catch (err) {
      return rejectWithValue(apiErrorMessage(err, "Could not set this address as default"));
    }
  }
);

const addressesSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {
    clearAddressesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAddressesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAddressesThunk.rejected, (state, action) => {
        state.status = "error";
        state.error = (action.payload as string) ?? "Could not load your addresses";
      })

      .addCase(createAddressThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createAddressThunk.rejected, (state, action) => {
        state.error = (action.payload as string) ?? "Could not save this address";
      })

      .addCase(updateAddressThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg.id;
      })
      .addCase(updateAddressThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.mutatingId = null;
      })
      .addCase(updateAddressThunk.rejected, (state, action) => {
        state.mutatingId = null;
        state.error = (action.payload as string) ?? "Could not save this address";
      })

      .addCase(deleteAddressThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg;
      })
      .addCase(deleteAddressThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.mutatingId = null;
      })
      .addCase(deleteAddressThunk.rejected, (state, action) => {
        state.mutatingId = null;
        state.error = (action.payload as string) ?? "Could not delete this address";
      })

      .addCase(setDefaultAddressThunk.pending, (state, action) => {
        state.error = null;
        state.mutatingId = action.meta.arg;
      })
      .addCase(setDefaultAddressThunk.fulfilled, (state, action) => {
        state.items = action.payload;
        state.mutatingId = null;
      })
      .addCase(setDefaultAddressThunk.rejected, (state, action) => {
        state.mutatingId = null;
        state.error = (action.payload as string) ?? "Could not set this address as default";
      })

      .addMatcher(
        (action): action is { type: string } =>
          typeof action?.type === "string" && action.type.startsWith("auth/logout"),
        (state) => {
          Object.assign(state, initialState);
        }
      );
  },
});

export const { clearAddressesError } = addressesSlice.actions;
export default addressesSlice.reducer;
