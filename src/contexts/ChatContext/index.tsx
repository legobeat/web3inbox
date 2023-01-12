import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import Web3InboxProxy from '../../w3iProxy'
import type { W3iChatClient } from '../../w3iProxy'
import ChatContext from './context'
import { formatEthChainsAddress } from '../../utils/address'
import type { ChatClientTypes } from '@walletconnect/chat-client'
import { asyncScheduler, interval } from 'rxjs'

interface ChatContextProviderProps {
  children: React.ReactNode | React.ReactNode[]
}

const ChatContextProvider: React.FC<ChatContextProviderProps> = ({ children }) => {
  const relayUrl = import.meta.env.VITE_RELAY_URL
  const projectId = import.meta.env.VITE_PROJECT_ID
  const providerQuery = new URLSearchParams(window.location.search).get('chatProvider')
  const [provider] = useState(
    providerQuery ? (providerQuery as Web3InboxProxy['chatProvider']) : 'internal'
  )

  console.log({ provider })

  const [chatClient, setChatClient] = useState<W3iChatClient | null>(null)
  const [registeredKey, setRegistered] = useState<string | null>(null)
  const [invites, setInvites] = useState<ChatClientTypes.Invite[]>([])
  const [threads, setThreads] = useState<ChatClientTypes.Thread[]>([])

  const { address } = useAccount()

  const [userPubkey, setUserPubkey] = useState<string | undefined>(undefined)

  useEffect(() => {
    chatClient?.observe('chat_account_change', {
      next: ({ account }) => {
        setUserPubkey(account)
      }
    })
  }, [chatClient])

  useEffect(() => {
    if (address) {
      setUserPubkey(address)
    }
  }, [address])

  useEffect(() => {
    if (!(chatClient && address)) {
      return
    }
    chatClient.register({ account: `eip155:1:${address}` }).then(setRegistered)
  }, [address, chatClient])

  useEffect(() => {
    if (chatClient) {
      return
    }

    const w3iProxy = new Web3InboxProxy(provider, projectId, relayUrl)
    w3iProxy.init().then(() => setChatClient(w3iProxy.chat))
  }, [setChatClient, chatClient])

  const refreshThreads = useCallback(() => {
    console.log('Call to refreshThreads', Boolean(chatClient))
    if (!chatClient) {
      return
    }

    chatClient
      .getInvites({ account: formatEthChainsAddress(userPubkey) })
      .then(invite => setInvites(Array.from(invite.values())))
    chatClient
      .getThreads({ account: formatEthChainsAddress(userPubkey) })
      .then(invite => setThreads(Array.from(invite.values())))
  }, [chatClient, setThreads, setInvites])

  useEffect(() => {
    if (!chatClient) {
      return
    }

    chatClient.observe('chat_invite', { next: refreshThreads })
    chatClient.observe('chat_joined', { next: refreshThreads })
  }, [chatClient])

  useEffect(() => {
    refreshThreads()
  }, [refreshThreads])

  return (
    <ChatContext.Provider
      value={{
        chatClientProxy: chatClient,
        userPubkey,
        refreshThreadsAndInvites: refreshThreads,
        threads,
        invites,
        registeredKey
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export default ChatContextProvider
