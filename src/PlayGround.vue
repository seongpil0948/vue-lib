<script setup lang="ts">
// import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { IoUser, type IO_ENV } from "@io-boxies/js-lib";
import { NSpace } from "naive-ui";
import { SearchUserAuto, UserSearchResult } from "./lib/components/input";
const env: IO_ENV =
  import.meta.env.MODE === "production" ? "io-prod" : "io-dev";
function onResult(result: UserSearchResult[]) {
  console.log("on result: ", result);
}
function onSelect(result: IoUser) {
  console.log("on Select: ", result);
}
</script>

<template>
  <NSpace vertical class="page-container">
    <SearchUserAuto
      :search-size="20"
      :env="(env as string)"
      @on-result="onResult"
      @on-select="onSelect"
    />
  </NSpace>
</template>

<style>
.page-container {
  justify-content: center !important;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #ffc800;
}
</style>
