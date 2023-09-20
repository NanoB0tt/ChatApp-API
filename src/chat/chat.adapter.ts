import { Chat } from "./entities/chat.entity"

function timeAdapter(date: Date) {
  const formatedDate = new Date(date)
    .toLocaleString('en-US', {
      hour12: false,
    }).split(',')[1].split(':')
  const hour = formatedDate[0]
  const minutes = formatedDate[1]
  return `${hour}:${minutes}`

}

export function getChatAdapter(chats: Chat | Chat[]) {
  if (Array.isArray(chats)) {
    return chats.map(chat => {
      const time = timeAdapter(chat.createdAt)
      return { ...chat, createdAt: time }
    })
  } else {
    const time = timeAdapter(chats.createdAt)
    return { ...chats, createdAt: time }
  }
}
