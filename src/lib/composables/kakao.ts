import { onMounted } from "vue";

export function useKakao() {
  let kakao: any = null;
  onMounted(async () => {
    if (!kakaoInitialized()) {
      await initializeScript();
    }
    kakao = await getKakao();
  });

  async function getKakao() {
    if (!kakaoInitialized()) {
      await initializeScript();
      return window.Kakao;
    } else {
      return window.Kakao;
    }
  }

  async function initializeScript() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/v1/kakao.min.js";
      script.defer = true;
      script.onload = () => {
        if (!kakaoInitialized()) {
          window.Kakao.init("96b525bca68b5ec991f5e96c39db8111");
        }

        resolve(null);
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
    kakao,
  };
}
