"use client";

import dynamic from "next/dynamic";
import { WidgetLoading } from "../ide/dynamic-workbench-widgets";

const loading = (label: string) => () => <WidgetLoading label={label} />;

export const DynamicSovereignCoreWorkspace = dynamic(
  () =>
    import("../dashboard/SovereignCoreWorkspace").then((m) => ({
      default: m.SovereignCoreWorkspace,
    })),
  { ssr: false, loading: loading("sovereign workspace") },
);

export const DynamicEntertainmentWorkspace = dynamic(
  () =>
    import("../entertainment/EntertainmentWorkspace").then((m) => ({
      default: m.EntertainmentWorkspace,
    })),
  { ssr: false, loading: loading("entertainment") },
);

export const DynamicVoiceTranslatorModal = dynamic(
  () =>
    import("../translator/VoiceTranslatorModal").then((m) => ({
      default: m.VoiceTranslatorModal,
    })),
  { ssr: false },
);

export const DynamicFloatingChatHistoryPanel = dynamic(
  () =>
    import("./FloatingChatHistoryPanel").then((m) => ({
      default: m.FloatingChatHistoryPanel,
    })),
  { ssr: false },
);
