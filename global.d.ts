import { AxiosInstance } from "axios";
import type { Router } from "vue-router";
import type { Kakao } from "@types/kakao-js-sdk";

declare global {
  interface Window {
    Kakao?: Kakao;
  }
}

declare module "vue" {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $http: AxiosInstance;
    $kakao: Kakao;
  }
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    // // by using a setter we can allow both strings and refs
    // set hello(value: string | Ref<string>);
    // get hello(): string;
    $http: AxiosInstance;
    $router: Router;
    $kakao: Kakao;
  }
  export interface DefineStoreOptionsBase<S, Store> {
    // allow defining a number of ms for any of the actions
    debounce?: Partial<Record<keyof StoreActions<Store>, number>>;
  }
}

declare module "vue-router" {
  export declare interface RouteMeta {
    allowRoles?: USER_ROLE[];
  }
  interface Router {
    goHome(user?: IoUser): void;
  }
}
