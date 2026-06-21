"use client";



import { OmniChatShell } from "../chat/OmniChatShell";



const GUEST_ID = "guest-founder";



interface DashboardHubProps {

  userId?: string;

  conversationId?: string;

  onConversationId?: (id: string) => void;

}



export function DashboardHub({

  userId = GUEST_ID,

  conversationId,

  onConversationId,

}: DashboardHubProps) {

  return (

    <OmniChatShell

      routeId="dashboard"

      userId={userId}

      conversationId={conversationId}

      onConversationId={onConversationId}

      showDashboardTools

    />

  );

}

