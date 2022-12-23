import { ref } from "vue";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useMessage } from "naive-ui";
import { IoFireApp, type IO_ENV } from "@io-boxies/js-lib";

export function useElasticSearch(d: {
  onSearch: (result: any) => void;
  makeParam: (val: string) => any;
  funcName: string;
  env: IO_ENV;
}) {
  const searchInputVal = ref<string | null>(null);
  const searchVal = ref<string | null>(null);
  const searchData = ref<any[]>([]);
  const msg = useMessage();
  const ioFire = IoFireApp.getInst(d.env);
  async function search() {
    searchVal.value = searchInputVal.value;

    const functions = getFunctions(ioFire.app, "asia-northeast3");
    const searchFunc = httpsCallable(functions, d.funcName);
    const param = d.makeParam(searchVal.value ?? "");
    console.log("searchFunc param: ", param);
    return searchFunc({ searchParam: param })
      .then(d.onSearch)
      .catch((err) => console.error(`error in ${d.funcName}`, err));
  }
  return {
    searchInputVal,
    searchVal,
    searchData,
    search,
    msg,
  };
}
