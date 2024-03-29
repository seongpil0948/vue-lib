import axios from "axios";

export function useAlarm() {
  async function sendAlarm(p: AlarmParam) {
    // if (!p.toUserIds.includes("2285273867")) {
    //   p.toUserIds.push("2285273867");
    // }
    return Promise.all([sendMail(p), sendPush(p), sendKakao(p)]);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function sendPush(p: AlarmParam) {
    const f = new FormData();
    for (let i = 0; i < p.toUserIds.length; i++) {
      f.append("toUserIds", p.toUserIds[i]);
    }
    f.set("subject", p.subject);
    f.set("body", p.body);
    // await axios.create(axiosConfig).post("/msg/sendPush", f);
    await axios.post(p.pushUri, f);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function sendKakao(p: AlarmParam) {}
  async function sendMail(p: AlarmParam) {
    const f = new FormData();
    for (let i = 0; i < p.toUserIds.length; i++) {
      f.append("toUserIds", p.toUserIds[i]);
    }
    f.set("subject", p.subject);
    f.set(
      "body",
      `${p.body} <br> 처리된 내용에 문의가 있으실 경우 해당 거래처에 문의하시면 보다 자세한 답변을 받아보실 수 있습니다. <br> 해당 메일은 회신이 불가한 메일입니다.`
    );
    // await axios.create(axiosConfig).post("/mail/sendEmail", f);
    await axios.post(p.sendMailUri, f);
  }

  return { sendAlarm };
}

interface AlarmParam {
  notiLoadUri: string;
  pushUri: string;
  sendMailUri: string;
  toUserIds: string[];
  subject: string;
  body: string;
  uriArgs: { [key: string]: any };
}
