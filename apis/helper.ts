import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ErrorRes } from "@/types";
import { buildQueryParams } from "@/lib/buildQueryParams";
import axios from "axios";
import queryClient from "@/lib/queryClient";

export type GetRegistrationInfoByTinResponse = {
  Tin: string;
  LegalCondtion: string;
  RegNo: string;
  RegDate: string;
  BusinessName: string;
  BusinessNameAmh: string;
  PaidUpCapital: number;
  AssociateShortInfos: Array<{
    Position: any;
    ManagerName: string;
    ManagerNameEng: string;
    Photo: string;
    MobilePhone: any;
    RegularPhone: any;
  }>;
  Businesses: Array<{
    MainGuid: string;
    OwnerTIN: string;
    DateRegistered: string;
    TradeNameAmh: string;
    TradesName: string;
    LicenceNumber: string;
    RenewalDate: string;
    RenewedFrom: string;
    RenewedTo: string;
    BusinessLicensingGroupMain: any;
    SubGroups: Array<
      | {
          Code: number;
          Description: string;
        }
      | undefined
    >;
  }>;
};


export async function getRegistrationInfoByTinFn(tin: string) {
  const res = await fetch(`/api/etrade/${tin}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
}



// Hooks
const Helper = {
  GetRegistrationInfoByTin: {
    useMutation: (
      options?: UseMutationOptions<
        GetRegistrationInfoByTinResponse,
        AxiosError<ErrorRes>,
        string
      >
    ) => {
      return useMutation({
        mutationFn: getRegistrationInfoByTinFn,
        onMutate: () => toast.loading("Fetching registration info..."),
        onSuccess: () => {
          toast.success("Registration info fetched successfully");
        },
        onError: (err) => {
          toast.error(
            err.response?.data.message || "Failed to fetch registration info"
          );
        },
        ...options,
      });
    },
  },
};

export default Helper;
