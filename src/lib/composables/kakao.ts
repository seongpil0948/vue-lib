import { onMounted } from "vue";
import { ioFire } from "@io-boxies/js-lib";

export function useKakao() {
  onMounted(async () => {
    if (!kakaoInitialized()) {
      await initializeScript();
    }
    const kakao = await getKakao();
  });

  async function getKakao() {
    if (!kakaoInitialized()) {
      await initializeScript();
      return window.Kakao;
    } else {
      return window.Kakao;
    }
  }

  function initializeScript(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/v1/kakao.min.js";
      script.defer = true;
      script.onload = () => {
        if (!kakaoInitialized()) {
          window.Kakao.init("96b525bca68b5ec991f5e96c39db8111");
        }

        resolve();
      };

      script.onerror = (error) => {
        throw new Error(
          `Error while initializeScript(KAKAO) ERROR: ${JSON.stringify(error)}`
        );
      };
      script.id = "kakao_script";
      document.body.appendChild(script);
    });
  }

  function kakaoInitialized() {
    if (!window.Kakao) {
      return false;
    }

    if (Object.keys(window.Kakao).length === 0) {
      return false;
    }

    return window.Kakao.isInitialized();
  }
  return {
    getKakao,
    initializeScript,
    kakaoInitialized,
  };
}
