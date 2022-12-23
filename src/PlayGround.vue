<script setup lang="ts">
// import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { IoUser, type IO_ENV } from "@io-boxies/js-lib";
import { NSpace } from "naive-ui";
import {
  LoginReturn,
  LoginView,
  SearchUserAuto,
  UserSearchResult,
} from "./lib";

const env: IO_ENV =
  import.meta.env.MODE === "production" ? "io-prod" : "io-dev";
function onResult(result: UserSearchResult[]) {
  console.log("on result: ", result);
}
function onSelect(result: IoUser) {
  console.log("on Select: ", result);
}

async function onLogin(data: LoginReturn | undefined) {
  console.log("LoginReturn:", data);
}

function onInternalError(err: any) {
  console.log(
    `onInternalError code: ${err.code}, message: ${err.message}`,
    err
  );
}
</script>

<template>
  <NSpace vertical class="page-container">
    <SearchUserAuto
      :search-size="5"
      :env="(env as string)"
      @on-result="onResult"
      @on-select="onSelect"
    />
    <LoginView
      :env="env"
      style="max-width: 500px"
      kakao-img-other-path="/img/icon-kakao-talk-black.png"
      kakao-img-path="/img/icon-kakao-talk.png"
      logo-img-path="/logo.png"
      @on-login="onLogin"
      @on-internal-error="onInternalError"
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
