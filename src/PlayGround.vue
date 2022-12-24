<script setup lang="ts">
// import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { IoUser, type IO_ENV } from "@io-boxies/js-lib";
import { NSpace } from "naive-ui";
import {
  LoginReturn,
  LoginView,
  SearchUserAuto,
  useAlarm,
  UserSearchResult,
} from "./lib";

const env: IO_ENV =
  import.meta.env.MODE === "production" ? "io-prod" : "io-dev";
const smtp = useAlarm();
function onResult(result: UserSearchResult[]) {
  console.log("on result: ", result);
}
function onSelect(result: IoUser) {
  console.log("on Select: ", result);
}
const API_URL = "https://io-box-develop.du.r.appspot.com/api";
async function onLogin(data: LoginReturn | undefined) {
  console.log("LoginReturn:", data);
  await smtp.sendAlarm({
    toUserIds: data?.user?.userInfo.userId ? [data?.user?.userInfo.userId] : [],
    subject: `inoutbox 주문 처리내역 알림.`,
    body: `배송 담당자가 배정되었습니다.`,
    notiLoadUri: "/",
    uriArgs: {},
    sendMailUri: `${API_URL}/mail/sendEmail`,
    pushUri: `${API_URL}/msg/sendPush`,
  });
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
      :show-role-selector="true"
      :env="(env as string)"
      @on-result="onResult"
      @on-select="onSelect"
    />
    <LoginView
      :env="env"
      :custom-token-url="`${API_URL}/auth/customToken`"
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
