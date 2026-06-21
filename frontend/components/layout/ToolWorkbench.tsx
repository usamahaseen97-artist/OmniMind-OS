"use client";



import { OmniChatShell } from "../chat/OmniChatShell";



const GUEST_ID = "guest-founder";



interface ToolWorkbenchProps {

  toolId: string;

  userId?: string;

}



export function ToolWorkbench({ toolId, userId = GUEST_ID }: ToolWorkbenchProps) {

  return <OmniChatShell routeId={toolId} userId={userId} />;

}

