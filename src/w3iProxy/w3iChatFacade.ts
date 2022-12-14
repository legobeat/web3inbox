import type { ChatClient, ChatClientTypes } from '@walletconnect/chat-client'
import type { Observer } from 'rxjs'
import { fromEvent } from 'rxjs'

type OmittedChatKeys =
  | 'chatInvites'
  | 'chatKeys'
  | 'chatMessages'
  | 'chatThreads'
  | 'chatThreadsPending'
  | 'core'
  | 'emit'
  | 'engine'
  | 'events'
  | 'history'
  | 'init'
  | 'logger'
  | 'name'
  | 'off'
  | 'on'
  | 'once'
  | 'removeListener'

export type W3iChat = Omit<ChatClient, OmittedChatKeys>

class W3iChatFacade implements W3iChat {
  private chatClient: ChatClient | undefined

  private formatClientRelatedError(method: string) {
    return `An initialized chat client is required for method: [${method}].`
  }

  public initState(chatClient: ChatClient) {
    this.chatClient = chatClient
  }
  public getMessages(params: { topic: string }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('reject'))
    }

    return this.chatClient.getMessages(params)
  }

  public async leave(params: { topic: string }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('leave'))
    }

    return this.chatClient.leave(params)
  }
  public async reject(params: { id: number }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('reject'))
    }

    return this.chatClient.reject(params)
  }

  public async accept(params: { id: number }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('accept'))
    }

    return this.chatClient.accept(params)
  }
  public getThreads() {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('getThreads'))
    }

    return this.chatClient.getThreads()
  }
  public getInvites() {
    if (this.chatClient) {
      return this.chatClient.getInvites()
    }

    return new Map<number, ChatClientTypes.Invite>()
  }
  public async invite(params: { account: string; invite: ChatClientTypes.PartialInvite }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('invite'))
    }

    return this.chatClient.invite(params)
  }
  public async ping(params: { topic: string }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('ping'))
    }

    return this.chatClient.ping(params)
  }
  public async message(params: { topic: string; payload: ChatClientTypes.Message }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('message'))
    }

    return this.chatClient.message(params)
  }

  public async register(params: { account: string; private?: boolean | undefined }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('register'))
    }

    return this.chatClient.register(params)
  }

  public async resolve(params: { account: string }) {
    if (!this.chatClient) {
      throw new Error(this.formatClientRelatedError('resolve'))
    }

    return this.chatClient.resolve(params)
  }

  public observe(eventName: string, observer: Observer<unknown>) {
    if (!this.chatClient) {
      throw new Error('Can not observe internal events when no chat client is initiated')
    }

    const observable = fromEvent(this.chatClient, eventName)
    observable.subscribe(observer)
  }
}

export default W3iChatFacade
