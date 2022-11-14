import {
  getAuth,
  signInWithCustomToken,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  UserCredential,
} from "@firebase/auth";
import { intervalToDuration } from "date-fns";
import { logEvent } from "@firebase/analytics";
import {
  analytics,
  FcmToken,
  getFcmToken,
  IoUser,
  KAKAO_CHANNEL_ID,
  USER_DB,
  USER_PROVIDER,
} from "@io-boxies/js-lib";
import axios from "../../plugin/axios";
import { useKakao } from "../kakao";

export function useLogin() {
  const auth = getAuth();
  const { getKakao } = useKakao();
  auth.languageCode = "ko";
  auth.useDeviceLanguage();
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/user.emails.read");
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

  async function login(
    credential: UserCredential,
    params: SignupParam
  ): Promise<LoginReturn> {
    /// toSignup (3th argument) is deprecated
    const user = await USER_DB.getUserById(credential.user.uid);
    if (user) {
      // >>> token >>>
      const token = await getFcmToken();
      const tokens = user.userInfo.fcmTokens ?? [];
      const newTokens: FcmToken[] = [];
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        const intervalParam = {
          start: new Date(),
          end:
            t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
        };

        const interval = intervalToDuration(intervalParam);
        if (interval.days && interval.days > 7) {
          newTokens.push(t);
        }
      }
      if (token !== null && tokens.every((t) => token.token !== t.token)) {
        newTokens.push(token);
      }
      user.userInfo.fcmTokens = newTokens;
      // <<< token <<<
      const data = {
        user,
        credential,
        toSignup: false,
        noConfirm: false,
        wrongPassword: false,
        params,
      };
      if (user.userInfo.passed) {
        return data;
      } else {
        data.noConfirm = true;
        return data;
      }
    } else {
      return {
        toSignup: true,
        noConfirm: false,
        wrongPassword: false,
        params,
        credential,
      };
    }
  }
  async function emailLogin(
    email: string,
    password: string
  ): Promise<LoginReturn | undefined> {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("signInWithEmailAndPassword: ", credential);
      const user = credential.user;
      return login(credential, {
        providerId: "EMAIL",
        userId: user.uid,
        userName: user.displayName ?? "",
        email: user.email ?? "",
        profileImg: user.photoURL ?? "",
        password,
      });
    } catch (e: any) {
      if (typeof e.code === "string") {
        const params: SignupParam = {
          userId: email,
          providerId: "EMAIL",
          email,
          password,
        };
        if (e.code.includes("user-not-found")) {
          return {
            toSignup: true,
            noConfirm: false,
            wrongPassword: false,
            params,
          };
        } else if (e.code.includes("auth/wrong-password")) {
          return {
            toSignup: true,
            noConfirm: false,
            wrongPassword: true,
            params,
          };
        }
      } else {
        throw e;
      }
    }
  }

  async function googleLogin(
    loginAfter = true
  ): Promise<LoginReturn | undefined> {
    return signInWithPopup(auth, provider).then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log("google credential: ", credential);
      logEvent(analytics, "login", { method: USER_PROVIDER.GOOGLE });
      const user = result.user;

      if (loginAfter) {
        return login(result, {
          providerId: "GOOGLE",
          userId: user.uid,
          userName: user.displayName ?? "",
          email: user.email ?? "",
          profileImg: user.photoURL ?? "",
        });
      }
    });
  }

  async function onKakaoLogin(
    auto: "loginForm" | "login"
  ): Promise<LoginReturn | undefined> {
    const kakao = await getKakao();
    return new Promise((resolve, reject) => {
      kakao.Auth[auto]({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        success: (obj: any) => {
          kakao.API.request({
            url: "/v2/user/me",
            success: async function (res: any) {
              const customRes = await axios.get(`/auth/customToken/${res.id}`); // kakao id
              signInWithCustomToken(auth, customRes.data.token)
                .then(async (uc) => {
                  logEvent(analytics, "login", { method: USER_PROVIDER.KAKAO });

                  kakao.API.request({
                    url: "/v1/api/talk/channels",
                    success: function (res: any) {
                      const ioChannel = (res.channels as any[]).find(
                        (x) => x.channel_public_id === KAKAO_CHANNEL_ID
                      );
                      if (!ioChannel) {
                        kakao.Channel.addChannel({
                          channelPublicId: KAKAO_CHANNEL_ID,
                        });
                      }
                    },
                  });

                  resolve(
                    login(uc, {
                      userId: uc.user.uid,
                      userName: uc.user.displayName ?? undefined,
                      email: res.kakao_account.email,
                      profileImg:
                        res.properties && res.properties.profile_image
                          ? res.properties.profile_image
                          : "/img/io-coin.png",
                      providerId: USER_PROVIDER.KAKAO,
                    })
                  );
                })
                .catch((error) => reject(error));
            },
            fail: (error: any) => reject(error),
          });
        },
        fail: function (err: any) {
          reject(err);
        },
      });
    });
  }
  return {
    login,
    onKakaoLogin,
    googleLogin,
    emailLogin,
  };
}

interface SignupParam {
  providerId: USER_PROVIDER;
  userId?: string;
  userName?: string;
  email?: string;
  profileImg?: string;
  password?: string;
}
export interface LoginReturn {
  user?: IoUser;
  toSignup: boolean;
  noConfirm: boolean;
  params: SignupParam;
  wrongPassword: boolean;
  credential?: UserCredential;
}
