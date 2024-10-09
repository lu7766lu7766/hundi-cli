import axios from "axios"

export const tgSendText = (tgKey: string, chat_id: string) =>
  tgKey
    ? (text: string) =>
        axios.post(`https://api.telegram.org/bot${tgKey}/`, {
          method: "sendMessage",
          chat_id,
          text,
        })
    : null
