import type { PushClientTypes, WalletClient as PushWalletClient } from '@walletconnect/push-client'
import type { EventEmitter } from 'events'
import { appNotificationsMock } from '../../utils/mocks'
import type { W3iPushProvider } from './types'

export default class InternalPushProvider implements W3iPushProvider {
  private pushClient: PushWalletClient | undefined
  private readonly emitter: EventEmitter
  public providerName = 'InternalPushProvider'

  public constructor(emitter: EventEmitter, _name = 'internal') {
    this.emitter = emitter
  }

  /*
   * We need to re-register events from the chat client to the emitter
   * to allow the observers in the facade to work seamlessly.
   */
  public initState(pushClient: PushWalletClient) {
    this.pushClient = pushClient

    this.pushClient.on('push_request', args => this.emitter.emit('push_request', args))
    this.pushClient.on('push_message', args => this.emitter.emit('push_message', args))
  }

  // ------------------------ Provider-specific methods ------------------------

  private formatClientRelatedError(method: string) {
    return `An initialized PushClient is required for method: [${method}].`
  }

  public isListeningToMethodFromPostMessage() {
    return false
  }

  public handleMessage() {
    throw new Error(`${this.providerName} does not support listening to external messages`)
  }

  // ------------------- Method-forwarding for PushWalletClient -------------------

  public async approve(params: { id: number }) {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('approve'))
    }

    return this.pushClient.approve(params)
  }

  public async reject(params: { id: number; reason: string }) {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('reject'))
    }

    return this.pushClient.reject(params)
  }

  public async subscribe(_params: { metadata: PushClientTypes.Metadata; account: string }) {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('subscribe'))
    }

    /**
     * TODO: Noop until we have a real push client implementation ready.
     */
    return Promise.resolve(false)
  }

  public async deleteSubscription(params: { topic: string }) {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('deleteSubscription'))
    }

    return this.pushClient.deleteSubscription(params)
  }

  public async getActiveSubscriptions() {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('getActiveSubscriptions'))
    }

    const activeSubscriptions = this.pushClient.getActiveSubscriptions()

    return Promise.resolve(activeSubscriptions)
  }

  public async getMessageHistory(params: { topic: string }) {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('getMessageHistory'))
    }

    return Promise.resolve(appNotificationsMock(params))

    /*
     * TODO: Hookup actual push client
     * return Promise.resolve(this.pushClient.getMessageHistory(params))
     */
  }

  public async deletePushMessage(params: { id: number }) {
    if (!this.pushClient) {
      throw new Error(this.formatClientRelatedError('deletePushMessage'))
    }

    this.pushClient.deletePushMessage(params)

    return Promise.resolve()
  }
}
