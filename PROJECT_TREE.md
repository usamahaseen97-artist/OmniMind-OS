# OmniMind Project — Directory Tree

```text
omnimind 1/
├── .github/
│   └── workflows/
│       └── production-deploy.yml
├── backend/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── dependencies.py
│   │   ├── router.py
│   │   └── security.py
│   ├── config/
│   │   └── production.json
│   ├── data/
│   │   ├── dev_projects/
│   │   │   └── ... (1 items)
│   │   ├── entertainment/
│   │   │   └── ... (11 items)
│   │   ├── finance/
│   │   │   └── ... (9 items)
│   │   ├── generated/
│   │   │   └── ... (3 items)
│   │   ├── kafka_pipeline/
│   │   │   ├── movie-events.jsonl
│   │   │   ├── music-events.jsonl
│   │   │   └── tv-events.jsonl
│   │   ├── logs/
│   │   │   ├── uvicorn-8001.err.log
│   │   │   └── uvicorn-8001.out.log
│   │   ├── chat_history.db
│   │   ├── pakistan_iptv_channels.json
│   │   └── songs_static.json
│   ├── media/
│   │   └── README.md
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── jwt_interceptor.py
│   ├── routers/
│   │   ├── core_tools/
│   │   │   ├── __init__.py
│   │   │   ├── analytics.py
│   │   │   ├── architect.py
│   │   │   ├── builder.py
│   │   │   ├── business.py
│   │   │   ├── marketing.py
│   │   │   ├── media.py
│   │   │   ├── medical.py
│   │   │   ├── science.py
│   │   │   ├── trading.py
│   │   │   └── vfx.py
│   │   ├── entertainment/
│   │   │   ├── __init__.py
│   │   │   ├── analytics.py
│   │   │   ├── live.py
│   │   │   ├── livetv.py
│   │   │   ├── media.py
│   │   │   ├── music.py
│   │   │   └── stream.py
│   │   ├── infra/
│   │   ├── __init__.py
│   │   ├── agent_pipelines.py
│   │   ├── agents_research.py
│   │   ├── app_builder.py
│   │   ├── business_automation.py
│   │   ├── business_builder.py
│   │   ├── chat.py
│   │   ├── chat_history.py
│   │   ├── dev_engine.py
│   │   ├── finance.py
│   │   ├── gateway.py
│   │   ├── infra_ops_stream.py
│   │   ├── llm_integration.py
│   │   ├── maps.py
│   │   ├── marketing.py
│   │   ├── media_core.py
│   │   ├── medical_diagnostic.py
│   │   ├── movies.py
│   │   ├── neural_agent.py
│   │   ├── omni_infra.py
│   │   ├── omni_tools.py
│   │   ├── omnicharge.py
│   │   ├── omnimind_execute.py
│   │   ├── orchestrator.py
│   │   ├── platform.py
│   │   ├── quantum_analytics.py
│   │   ├── science.py
│   │   ├── simulation_nodes.py
│   │   ├── spatial.py
│   │   ├── spatial_engine.py
│   │   ├── spatial_hybrid.py
│   │   ├── stream_preview.py
│   │   ├── streaming.py
│   │   ├── streaming_kafka.py
│   │   ├── streaming_spark.py
│   │   ├── system.py
│   │   ├── terminal_stream.py
│   │   ├── tools_status.py
│   │   ├── translate.py
│   │   ├── tv_live_grid.py
│   │   ├── user_analytics.py
│   │   ├── v1.py
│   │   ├── webhooks.py
│   │   └── workflows.py
│   ├── sandbox/
│   │   ├── app-web/
│   │   │   ├── backend/
│   │   │   │   ├── routers/
│   │   │   │   │   └── api.py
│   │   │   │   └── main.py
│   │   │   └── src/
│   │   │       ├── app/
│   │   │       │   └── page.tsx
│   │   │       └── hooks/
│   │   │           └── useAuth.ts
│   │   ├── business-web/
│   │   │   ├── backend/
│   │   │   │   ├── controllers/
│   │   │   │   │   └── salesController.py
│   │   │   │   ├── models/
│   │   │   │   │   └── inventory.db
│   │   │   │   └── routes/
│   │   │   │       └── pricing.py
│   │   │   └── frontend/
│   │   │       ├── components/
│   │   │       │   ├── LandingHero.tsx
│   │   │       │   └── ProductCard.tsx
│   │   │       └── pages/
│   │   │           └── checkout/
│   │   │               └── index.tsx
│   │   └── game-dev/
│   │       ├── assets/
│   │       │   └── sprites/
│   │       │       └── player.png
│   │       ├── physics/
│   │       │   └── collision_engine.js
│   │       ├── scenes/
│   │       │   └── Level1.js
│   │       └── states/
│   │           └── gameState.js
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── sovereign_tools.py
│   │   ├── strict.py
│   │   └── validators.py
│   ├── scripts/
│   │   ├── health_check.py
│   │   ├── init_streaming_stack.py
│   │   ├── test_audius.py
│   │   ├── test_mongodb.py
│   │   └── test_omnimusic_resolve.py
│   ├── services/
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── analytics_tool.py
│   │   │   ├── architect_tool.py
│   │   │   ├── builder_tool.py
│   │   │   ├── business_tool.py
│   │   │   ├── marketing_tool.py
│   │   │   ├── media_tool.py
│   │   │   ├── medical_tool.py
│   │   │   ├── science_tool.py
│   │   │   ├── trading_tool.py
│   │   │   └── vfx_tool.py
│   │   ├── __init__.py
│   │   ├── agent_pipelines.py
│   │   ├── agent_system_prompts.py
│   │   ├── api_keys.py
│   │   ├── app_builder_engine.py
│   │   ├── architecture_blueprint.py
│   │   ├── async_job_queue.py
│   │   ├── audius_client.py
│   │   ├── bloomberg_client.py
│   │   ├── ccxt_market.py
│   │   ├── chat_history_sql.py
│   │   ├── cloud_neural_agent.py
│   │   ├── connection_controller.py
│   │   ├── context_manager.py
│   │   ├── conversation_store.py
│   │   ├── dev_sandbox_engine.py
│   │   ├── elasticsearch_songs.py
│   │   ├── embedding_pipeline.py
│   │   ├── entertainment_pipeline.py
│   │   ├── entertainment_resilience.py
│   │   ├── event_pipeline.py
│   │   ├── execution_context.py
│   │   ├── execution_triggers.py
│   │   ├── fast_image_response.py
│   │   ├── finance_pipeline.py
│   │   ├── free_video_providers.py
│   │   ├── gemini_embeddings.py
│   │   ├── gemini_stream.py
│   │   ├── gemini_tools.py
│   │   ├── geocode.py
│   │   ├── hf_space_video.py
│   │   ├── image_generation.py
│   │   ├── image_inpainting.py
│   │   ├── image_prompt_intelligence.py
│   │   ├── image_synthesis.py
│   │   ├── image_url_utils.py
│   │   ├── infra_ops_log.py
│   │   ├── infra_pool.py
│   │   ├── integration_gateway.py
│   │   ├── kafka_bus.py
│   │   ├── kafka_pipeline.py
│   │   ├── language_orchestration.py
│   │   ├── lead_architect_prompt.py
│   │   ├── live_preview.py
│   │   ├── live_stream.py
│   │   ├── lm_auth.py
│   │   ├── lm_studio.py
│   │   ├── local_instant.py
│   │   ├── local_llm.py
│   │   ├── maps_intelligence.py
│   │   ├── media_prompt_llm.py
│   │   ├── medical_diagnostic_engine.py
│   │   ├── memory.py
│   │   ├── memory_store.py
│   │   ├── message_normalize.py
│   │   ├── model_router.py
│   │   ├── mongo_async.py
│   │   ├── mongo_pools.py
│   │   ├── movie_analytics.py
│   │   ├── movie_spark_analytics.py
│   │   ├── music_fast.py
│   │   ├── music_intent.py
│   │   ├── n8n_client.py
│   │   ├── omni_tool_handlers.py
│   │   ├── omnicharge.py
│   │   ├── omniforge_lead_architect.py
│   │   ├── omniforge_polyglot_registry.py
│   │   ├── omniforge_sandbox_scaffold.py
│   │   ├── omniforge_swarm_orchestrator.py
│   │   ├── omnimind_tool_executor.py
│   │   ├── omnimovies_international.py
│   │   ├── omnimusic_bulk_catalog.py
│   │   ├── omnimusic_catalog.py
│   │   ├── omnimusic_global_search.py
│   │   ├── omnimusic_resolver.py
│   │   ├── omnimusic_search_intel.py
│   │   ├── omnimusic_store.py
│   │   ├── omnimusic_trending.py
│   │   ├── omnistream_catalog.py
│   │   ├── proactive.py
│   │   ├── process_utils.py
│   │   ├── prompt_enhancement.py
│   │   ├── prompts.py
│   │   ├── provider_registry.py
│   │   ├── public_api.py
│   │   ├── redis_cache.py
│   │   ├── router.py
│   │   ├── router_guard.py
│   │   ├── songs_static_provider.py
│   │   ├── spark_analytics.py
│   │   ├── spark_client.py
│   │   ├── spatial_overlay.py
│   │   ├── spatial_runtime_engine.py
│   │   ├── spotify_youtube_music.py
│   │   ├── stream_sse.py
│   │   ├── streaming_orchestrator.py
│   │   ├── subject_segmentation.py
│   │   ├── superapp_ai.py
│   │   ├── system_registry.py
│   │   ├── tavily.py
│   │   ├── tmdb_client.py
│   │   ├── tool_context.py
│   │   ├── translator.py
│   │   ├── v11_memory_mesh.py
│   │   ├── validation_handlers.py
│   │   ├── video_diffusion_gateway.py
│   │   ├── video_engine.py
│   │   ├── video_generation.py
│   │   ├── video_image_conditioning.py
│   │   ├── video_job_queue.py
│   │   ├── video_pipeline.py
│   │   ├── video_prompt_intelligence.py
│   │   ├── video_source_store.py
│   │   ├── visual_context_manager.py
│   │   └── wan_video.py
│   ├── .env
│   ├── .env.example
│   ├── agents.py
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── Dockerfile
│   ├── main.py
│   ├── omni_orchestrator.py
│   ├── requirements-agents.txt
│   ├── requirements.txt
│   └── runtime.py
├── backend-fastapi/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── deps.py
│   │   │   ├── files.py
│   │   │   ├── logs.py
│   │   │   ├── projects.py
│   │   │   └── terminal.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── chat_stream.py
│   │   │   ├── core_python_providers.py
│   │   │   ├── language_orchestration.py
│   │   │   ├── model_router.py
│   │   │   └── resilience.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── db.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── redis_client.py
│   │   ├── schemas.py
│   │   └── security.py
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   └── 002_oauth_refresh.sql
│   ├── .env.example
│   ├── Dockerfile
│   ├── omniforge.dev.db
│   └── requirements.txt
├── backend-node/
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   ├── package-lock.json
│   └── package.json
├── config/
│   └── elasticsearch/
│       └── elasticsearch.yml
├── contracts/
│   └── proto/
│       └── omnimind_internal.proto
├── core-python/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py
│   │   │   └── providers.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── community_api_sync.py
│   │   │   ├── context_compression.py
│   │   │   ├── github_models.py
│   │   │   └── provider_router.py
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── main.py
│   ├── data/
│   │   ├── community_api_seed.json
│   │   └── community_apis.json
│   ├── README.md
│   └── requirements.txt
├── core_engine/
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── (shell)/
│   │   │   ├── app-builder/
│   │   │   │   └── page.tsx
│   │   │   ├── architectural-designer/
│   │   │   │   └── page.tsx
│   │   │   ├── business-analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── business-site-maker/
│   │   │   │   └── page.tsx
│   │   │   ├── creative-visionary/
│   │   │   │   └── page.tsx
│   │   │   ├── digital-marketing-hub/
│   │   │   │   └── page.tsx
│   │   │   ├── game-dev/
│   │   │   │   └── page.tsx
│   │   │   ├── interior-landscape/
│   │   │   │   └── page.tsx
│   │   │   ├── medical-diagnostic/
│   │   │   │   └── page.tsx
│   │   │   ├── nasa-solver/
│   │   │   │   └── page.tsx
│   │   │   ├── omniforge-engine/
│   │   │   │   └── page.tsx
│   │   │   ├── omnimap/
│   │   │   │   └── page.tsx
│   │   │   ├── omnimovies/
│   │   │   │   └── page.tsx
│   │   │   ├── omnimusic/
│   │   │   │   └── page.tsx
│   │   │   ├── omnitranslator/
│   │   │   │   └── page.tsx
│   │   │   ├── omnitv/
│   │   │   │   └── page.tsx
│   │   │   ├── quantum-trading/
│   │   │   │   └── page.tsx
│   │   │   ├── vfx-master/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── architect/
│   │   │   │   ├── deploy-hook/
│   │   │   │   │   └── route.ts
│   │   │   │   └── provision-db/
│   │   │   │       └── route.ts
│   │   │   ├── execute/
│   │   │   │   └── route.ts
│   │   │   ├── media/
│   │   │   │   ├── image/
│   │   │   │   │   └── route.ts
│   │   │   │   └── video/
│   │   │   │       └── [filename]/
│   │   │   │           └── route.ts
│   │   │   ├── omnistream/
│   │   │   │   ├── image/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   ├── library/
│   │   │   │   │   └── route.ts
│   │   │   │   └── stream/
│   │   │   │       └── [id]/
│   │   │   │           └── route.ts
│   │   │   └── omnitv/
│   │   │       ├── channels/
│   │   │       │   ├── [id]/
│   │   │       │   │   ├── episodes/
│   │   │       │   │   │   └── route.ts
│   │   │       │   │   └── live/
│   │   │       │   │       └── route.ts
│   │   │       │   └── route.ts
│   │   │       ├── events/
│   │   │       │   ├── publish/
│   │   │       │   │   └── route.ts
│   │   │       │   └── route.ts
│   │   │       ├── news/
│   │   │       │   └── route.ts
│   │   │       ├── youtube-live/
│   │   │       │   └── route.ts
│   │   │       ├── youtube-live-id/
│   │   │       │   └── route.ts
│   │   │       └── _lib.ts
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── about/
│   │   │   └── AboutPanel.tsx
│   │   ├── architect/
│   │   │   ├── ArchitectBottomChat.tsx
│   │   │   ├── ArchitectBuildWorkspace.tsx
│   │   │   ├── ArchitectChoicePanel.tsx
│   │   │   ├── ArchitectCodeBotTerminal.tsx
│   │   │   ├── ArchitectIDEWorkspace.tsx
│   │   │   ├── index.ts
│   │   │   ├── LiveSimulationViewport.tsx
│   │   │   ├── OmniArchitectWizard.tsx
│   │   │   ├── PanelResizeHandle.tsx
│   │   │   └── ProjectFileDrawer.tsx
│   │   ├── auth/
│   │   │   └── AuthButton.tsx
│   │   ├── chat/
│   │   │   ├── ActiveToolChips.tsx
│   │   │   ├── CentralSuggestionHub.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatSuggestions.tsx
│   │   │   ├── ChatSuggestionStrip.tsx
│   │   │   ├── ChatUploadBar.tsx
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatWorkspace.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── GeminiCenterComposer.tsx
│   │   │   ├── GeminiGlassDock.tsx
│   │   │   ├── GeneratedImageGallery.tsx
│   │   │   ├── InputCommandMenu.tsx
│   │   │   ├── MarkdownMessage.tsx
│   │   │   ├── MarkdownMessageBody.tsx
│   │   │   ├── MediaMessageActions.tsx
│   │   │   ├── OmniChatShell.tsx
│   │   │   ├── StagedAttachmentsStrip.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   ├── WelcomePillBar.tsx
│   │   │   └── WelcomeScreen.tsx
│   │   ├── creative/
│   │   │   ├── CreativeVideoDurationPanel.tsx
│   │   │   └── CreativeVisionaryStudio.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHub.tsx
│   │   │   ├── GeminiCoreChat.tsx
│   │   │   ├── OmniMindMultiAgentChassis.tsx
│   │   │   └── SovereignCoreWorkspace.tsx
│   │   ├── deck/
│   │   │   ├── panels/
│   │   │   │   ├── DeckAnalyticsPanel.tsx
│   │   │   │   ├── DeckArchitecturePanel.tsx
│   │   │   │   ├── DeckCreativePanel.tsx
│   │   │   │   ├── DeckDevOpsPanel.tsx
│   │   │   │   ├── DeckGamePanel.tsx
│   │   │   │   ├── DeckMapsPanel.tsx
│   │   │   │   ├── DeckMarketingPanel.tsx
│   │   │   │   ├── DeckMedicalPanel.tsx
│   │   │   │   ├── DeckMetaPanel.tsx
│   │   │   │   ├── DeckNasaPanel.tsx
│   │   │   │   └── DeckTradingPanel.tsx
│   │   │   ├── AgentDeckViewport.tsx
│   │   │   ├── DeckChartsMock.tsx
│   │   │   ├── DeckIdeMock.tsx
│   │   │   ├── DeckIdlePanel.tsx
│   │   │   ├── DeckMicroLoader.tsx
│   │   │   ├── DeckShell.tsx
│   │   │   └── DeckVfxMock.tsx
│   │   ├── ecosystem/
│   │   │   ├── OmniMindAgentPanelExtensions.tsx
│   │   │   ├── OmniMindCommandPalette.tsx
│   │   │   ├── OmniMindDatabaseConfirmPrompt.tsx
│   │   │   ├── OmniMindDeployStrip.tsx
│   │   │   ├── OmniMindDiagnosticPanel.tsx
│   │   │   ├── OmniMindDropZone.tsx
│   │   │   ├── OmniMindEcosystemShell.tsx
│   │   │   ├── OmniMindEcosystemTopBar.tsx
│   │   │   ├── OmniMindFloatingEditorMenu.tsx
│   │   │   ├── OmniMindKeyboardBindings.tsx
│   │   │   ├── OmniMindNotificationStream.tsx
│   │   │   ├── OmniMindQuickSearch.tsx
│   │   │   ├── OmniMindRecentProjectsPane.tsx
│   │   │   └── OmniMindStatusBar.tsx
│   │   ├── entertainment/
│   │   │   ├── EntertainmentMediaSearchBar.tsx
│   │   │   ├── EntertainmentMoodProvider.tsx
│   │   │   ├── EntertainmentShell.tsx
│   │   │   ├── EntertainmentWorkspace.tsx
│   │   │   ├── HlsVideoPlayer.tsx
│   │   │   ├── OmniChargeView.tsx
│   │   │   ├── OmniLivePlayer.tsx
│   │   │   ├── OmniMoviesView.tsx
│   │   │   ├── OmniMusicLibraryRail.tsx
│   │   │   ├── OmniMusicNowPlaying.tsx
│   │   │   ├── OmniMusicPlayer.tsx
│   │   │   ├── OmniMusicSearchPanel.tsx
│   │   │   ├── OmniMusicTopBar.tsx
│   │   │   ├── OmniMusicView.tsx
│   │   │   ├── OmniStreamView.tsx
│   │   │   ├── OmniTVChannelCard.tsx
│   │   │   ├── OmniTVEpisodes.tsx
│   │   │   ├── OmniTVLiveEvents.tsx
│   │   │   ├── OmniTVPlayer.tsx
│   │   │   ├── OmniTVSkeletons.tsx
│   │   │   ├── OmniTVView.tsx
│   │   │   └── StreamingInfraBadge.tsx
│   │   ├── history/
│   │   │   └── NeuralHistoryPanel.tsx
│   │   ├── ide/
│   │   │   ├── client/
│   │   │   │   ├── ClientMountGate.tsx
│   │   │   │   └── dynamic-engines.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── modules/
│   │   │   │   │   ├── LayoutModuleA.tsx
│   │   │   │   │   ├── LayoutModuleB.tsx
│   │   │   │   │   ├── LayoutModuleC.tsx
│   │   │   │   │   ├── LayoutModuleF.tsx
│   │   │   │   │   ├── LayoutModuleG.tsx
│   │   │   │   │   ├── LayoutModuleH.tsx
│   │   │   │   │   └── LayoutModuleI.tsx
│   │   │   │   ├── omniforge/
│   │   │   │   │   ├── engine/
│   │   │   │   │   │   ├── OmniForgeApiTesterPanel.tsx
│   │   │   │   │   │   ├── OmniForgeCopilotStrip.tsx
│   │   │   │   │   │   ├── OmniForgeDatabasePanel.tsx
│   │   │   │   │   │   ├── OmniForgeEngineToolbar.tsx
│   │   │   │   │   │   ├── OmniForgeExplorerActivityRail.tsx
│   │   │   │   │   │   ├── OmniForgeExtensionsPanel.tsx
│   │   │   │   │   │   └── OmniForgeWorkbenchBottomPanel.tsx
│   │   │   │   │   ├── shell/
│   │   │   │   │   │   └── OmniForgeTopNav.tsx
│   │   │   │   │   ├── ui/
│   │   │   │   │   │   ├── GlassSection.tsx
│   │   │   │   │   │   ├── OmniForgeLiveModeFab.tsx
│   │   │   │   │   │   └── OmniForgeModeDock.tsx
│   │   │   │   │   ├── omniforge-theme.ts
│   │   │   │   │   ├── OmniForgeAgentPane.tsx
│   │   │   │   │   ├── OmniForgeCodePane.tsx
│   │   │   │   │   ├── OmniForgeCodingWorkspaceSection.tsx
│   │   │   │   │   ├── OmniForgeCommsConsole.tsx
│   │   │   │   │   ├── OmniForgeConnectionBar.tsx
│   │   │   │   │   ├── OmniForgeDevMenuBar.tsx
│   │   │   │   │   ├── OmniForgeEngineControls.tsx
│   │   │   │   │   ├── OmniForgeEngineTopBar.tsx
│   │   │   │   │   ├── OmniForgeExplorerSection.tsx
│   │   │   │   │   ├── OmniForgeFileExplorer.tsx
│   │   │   │   │   ├── OmniForgeFourGridShell.tsx
│   │   │   │   │   ├── OmniForgeLivePreviewPane.tsx
│   │   │   │   │   ├── OmniForgeMobileBlocks.tsx
│   │   │   │   │   ├── OmniForgeResizableShell.tsx
│   │   │   │   │   ├── OmniForgeSectionExplorer.tsx
│   │   │   │   │   ├── OmniForgeStackBootstrap.tsx
│   │   │   │   │   ├── OmniForgeTerminal.tsx
│   │   │   │   │   ├── OmniForgeTerminalPane.tsx
│   │   │   │   │   ├── OmniForgeThemeRoot.tsx
│   │   │   │   │   ├── OmniForgeVisualPreviewSection.tsx
│   │   │   │   │   └── OmniForgeWorkspaceBoot.tsx
│   │   │   │   ├── CreativeVisionaryShell.tsx
│   │   │   │   ├── FourZoneShell.tsx
│   │   │   │   ├── layout-shared.tsx
│   │   │   │   ├── LiveInteractivePreview.tsx
│   │   │   │   ├── MedicalStudioShell.tsx
│   │   │   │   ├── ModuleLayouts.tsx
│   │   │   │   ├── SpatialStudioResizableGrid.tsx
│   │   │   │   ├── SpatialStudioShell.tsx
│   │   │   │   ├── SplitWorkspace.tsx
│   │   │   │   ├── ThreePanelDevShell.tsx
│   │   │   │   ├── TriplePanelResizeShell.tsx
│   │   │   │   ├── WorkbenchLayoutRouter.tsx
│   │   │   │   ├── WorkspaceShell.tsx
│   │   │   │   └── ZoneContentRouter.tsx
│   │   │   ├── live/
│   │   │   │   ├── IDELiveSimViews.tsx
│   │   │   │   └── WorkbenchLiveViewport.tsx
│   │   │   ├── matrix/
│   │   │   │   ├── live/
│   │   │   │   │   ├── ArchitecturalScene3D.tsx
│   │   │   │   │   ├── CinematicScene3D.tsx
│   │   │   │   │   ├── MatrixScene3D.tsx
│   │   │   │   │   ├── scene-asset-types.ts
│   │   │   │   │   ├── SpatialCanvasSizeSync.tsx
│   │   │   │   │   ├── ToolLiveSimAnalytics.tsx
│   │   │   │   │   ├── ToolLiveSimDesign.tsx
│   │   │   │   │   ├── ToolLiveSimGeneric.tsx
│   │   │   │   │   ├── ToolLiveSimMarketing.tsx
│   │   │   │   │   ├── ToolLiveSimMedical.tsx
│   │   │   │   │   ├── ToolLiveSimScience.tsx
│   │   │   │   │   ├── ToolLiveSimTrading.tsx
│   │   │   │   │   ├── ToolLiveSimVfx.tsx
│   │   │   │   │   └── ToolLiveSimVideo.tsx
│   │   │   │   ├── workspace/
│   │   │   │   │   └── ToolWorkspacePanels.tsx
│   │   │   │   ├── ToolLiveSimMatrix.tsx
│   │   │   │   └── ToolWorkspaceMatrix.tsx
│   │   │   ├── motion/
│   │   │   │   └── AnimatedToolViewport.tsx
│   │   │   ├── workspace/
│   │   │   │   ├── AgentChatConsole.tsx
│   │   │   │   ├── AgentChatHub.tsx
│   │   │   │   ├── AssetPipelineLogger.tsx
│   │   │   │   ├── CollapsibleBottomTerminal.tsx
│   │   │   │   ├── DevChatInputDock.tsx
│   │   │   │   ├── DevFileTreeColumn.tsx
│   │   │   │   ├── DevFileTreePanel.tsx
│   │   │   │   ├── DeviceFrameCanvas.tsx
│   │   │   │   ├── DevicePreviewWrapper.tsx
│   │   │   │   ├── DevOmniChatConsole.tsx
│   │   │   │   ├── DevTelemetryMetrics.tsx
│   │   │   │   ├── DevTrioPreviewPane.tsx
│   │   │   │   ├── GlassScrollViewport.tsx
│   │   │   │   ├── IDEWorkspacePanels.tsx
│   │   │   │   ├── MarketingCompositionCanvas.tsx
│   │   │   │   ├── OmniForgeSessionBar.tsx
│   │   │   │   ├── ProjectUtilityDeck.tsx
│   │   │   │   ├── SpatialCanvasResizeHost.tsx
│   │   │   │   ├── SpatialManualTweakPanel.tsx
│   │   │   │   ├── SpatialMaterialTray.tsx
│   │   │   │   ├── SpatialRenderToggle.tsx
│   │   │   │   ├── SpatialRenderViewport.tsx
│   │   │   │   ├── SpatialSceneTimeline.tsx
│   │   │   │   ├── SpatialStudioCenter.tsx
│   │   │   │   ├── SpatialUtilityDeck.tsx
│   │   │   │   ├── StreamingCodeEngine.tsx
│   │   │   │   ├── UnifiedWorkbenchChatLayers.tsx
│   │   │   │   └── WorkbenchAgentBranding.tsx
│   │   │   ├── ActivityBar.tsx
│   │   │   ├── ActivityToolsDrawer.tsx
│   │   │   ├── dynamic-layout-modules.tsx
│   │   │   ├── dynamic-sovereign-shell.tsx
│   │   │   ├── dynamic-workbench-widgets.tsx
│   │   │   ├── dynamic-workbench.tsx
│   │   │   ├── IDEBottomPanel.tsx
│   │   │   ├── IDECoreActivityBar.tsx
│   │   │   ├── IDEMonacoWorkspace.tsx
│   │   │   ├── IDEPane.tsx
│   │   │   ├── IDEProjectFileTree.tsx
│   │   │   ├── IDEProvider.tsx
│   │   │   ├── IDERightPanel.tsx
│   │   │   ├── IDETabBar.tsx
│   │   │   ├── IDETopMenuBar.tsx
│   │   │   ├── index.ts
│   │   │   ├── OmniMindIDEShell.tsx
│   │   │   ├── SovereignActivityBar.tsx
│   │   │   ├── SovereignWorkbenchShell.tsx
│   │   │   ├── ToolSwitcher.tsx
│   │   │   └── ToolWorkbenchHeader.tsx
│   │   ├── layout/
│   │   │   ├── AgentArchitectureDropdown.tsx
│   │   │   ├── AgentSandboxSplit.tsx
│   │   │   ├── AppBranding.tsx
│   │   │   ├── AppCommandRail.tsx
│   │   │   ├── AppViewSidebar.tsx
│   │   │   ├── ChatHistoryPanel.tsx
│   │   │   ├── ClientErrorBoundary.tsx
│   │   │   ├── CollapsibleExecutionPanel.tsx
│   │   │   ├── CoreToolsSidebar.tsx
│   │   │   ├── ExecutionWorkspacePanel.tsx
│   │   │   ├── FloatingChatHistoryPanel.tsx
│   │   │   ├── FounderCredit.tsx
│   │   │   ├── FounderProfile.tsx
│   │   │   ├── GeminiSidebar.tsx
│   │   │   ├── GlobalMenuDrawer.tsx
│   │   │   ├── HistoryClockToggle.tsx
│   │   │   ├── HorizontalToolDock.tsx
│   │   │   ├── LiveEngineIndicator.tsx
│   │   │   ├── LiveExecutionDeck.tsx
│   │   │   ├── LivePreviewPanel.tsx
│   │   │   ├── LiveRenderWorkspace.tsx
│   │   │   ├── LiveVideoPlayer.tsx
│   │   │   ├── MacroEngineTabs.tsx
│   │   │   ├── MetaAgentsSidebar.tsx
│   │   │   ├── OmniMindCoreLayout.tsx
│   │   │   ├── OmniMindDispatchComposer.tsx
│   │   │   ├── OmniMindLayout.tsx
│   │   │   ├── OmniMindOS.tsx
│   │   │   ├── OmniMindToolWorkspace.tsx
│   │   │   ├── OmniMindUnifiedOS.tsx
│   │   │   ├── OmniMindWorkspacePanels.tsx
│   │   │   ├── OmniSidebar.tsx
│   │   │   ├── SystemCapacityPanel.tsx
│   │   │   ├── ToolWorkbench.tsx
│   │   │   └── UndoBackButton.tsx
│   │   ├── marketing/
│   │   │   ├── DigitalMarketingHubShell.tsx
│   │   │   ├── MarketingAgentHub.tsx
│   │   │   ├── MarketingHubUtilityBar.tsx
│   │   │   ├── MarketingHubWorkspace.tsx
│   │   │   └── MarketingSocialCaptionPanel.tsx
│   │   ├── medical/
│   │   │   ├── MedicalDiagnosticViewport.tsx
│   │   │   ├── MedicalIngestionTray.tsx
│   │   │   ├── MedicalManualControls.tsx
│   │   │   ├── MedicalOmniChatConsole.tsx
│   │   │   ├── MedicalScanCanvas2D.tsx
│   │   │   ├── MedicalScanTimeline.tsx
│   │   │   └── MedicalVolumetricScene3D.tsx
│   │   ├── music/
│   │   │   ├── MusicPlayer.jsx
│   │   │   └── MusicPlayer.tsx
│   │   ├── superapp/
│   │   │   ├── BusinessArchitectPanel.tsx
│   │   │   ├── MarketingKingPanel.tsx
│   │   │   ├── NasaSciencePanel.tsx
│   │   │   ├── OmniMapsPanel.tsx
│   │   │   ├── OmniMapView.tsx
│   │   │   ├── PostPreviewCard.tsx
│   │   │   ├── SuperToolSuggestionBar.tsx
│   │   │   └── SuperToolWorkspace.tsx
│   │   ├── system/
│   │   │   └── SystemModulesPanel.tsx
│   │   ├── theme/
│   │   │   ├── ThemeHub.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── tools/
│   │   │   ├── panels/
│   │   │   │   ├── OmniTranslatorPanel.tsx
│   │   │   │   └── ToolPanels.tsx
│   │   │   ├── DynamicSovereignToolPage.tsx
│   │   │   ├── SovereignIconRail.tsx
│   │   │   ├── SovereignToolPage.tsx
│   │   │   ├── SovereignToolsSidebar.tsx
│   │   │   ├── ToolSplitShell.tsx
│   │   │   ├── ToolsWorkspace.tsx
│   │   │   └── ToolWorkspaceFrame.tsx
│   │   ├── translator/
│   │   │   └── VoiceTranslatorModal.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── IconScrollActions.tsx
│   │   │   ├── OmniChipScrollRow.tsx
│   │   │   └── sheet.tsx
│   │   ├── workbench/
│   │   │   └── OmniWebDevelopmentWorkbench.tsx
│   │   ├── GlassCard.tsx
│   │   ├── IntegrationGrid.tsx
│   │   ├── RightPanel.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── data/
│   │   ├── channels.json
│   │   └── legal-live-channels.json
│   ├── hooks/
│   │   ├── use-triple-panel-resize.ts
│   │   ├── useAgentChatMessages.ts
│   │   ├── useBusinessAnalyticsPipeline.ts
│   │   ├── useHorizontalResize.ts
│   │   ├── useMusicVoiceSearch.ts
│   │   ├── useStreamPreviewGateway.ts
│   │   └── useTranslatorBridgeState.ts
│   ├── lib/
│   │   ├── server/
│   │   │   ├── jellyfin.ts
│   │   │   ├── omnitv-events.ts
│   │   │   └── youtube-live-resolver.ts
│   │   ├── active-video-source.ts
│   │   ├── activity-bar.ts
│   │   ├── agent-architecture-options.ts
│   │   ├── agent-chat-storage.ts
│   │   ├── agent-deck-slot.ts
│   │   ├── agent-driven-deck.ts
│   │   ├── agent-live-deck-store.ts
│   │   ├── agent-output-interceptor.ts
│   │   ├── agent-pipeline-api.ts
│   │   ├── agent-pipeline-store.ts
│   │   ├── agent-pipeline-triggers.ts
│   │   ├── agent-runtime-fallback.ts
│   │   ├── agent-suggestions.ts
│   │   ├── agents-research-api.ts
│   │   ├── agents.ts
│   │   ├── api-config.ts
│   │   ├── api.ts
│   │   ├── app-views.ts
│   │   ├── architect-flow-api.ts
│   │   ├── architect-flow.ts
│   │   ├── backend-health.ts
│   │   ├── backend-url.ts
│   │   ├── bigdata-api.ts
│   │   ├── brand-labels.ts
│   │   ├── chat-api.ts
│   │   ├── chat-events.ts
│   │   ├── chat-image-url.ts
│   │   ├── chat-storage.ts
│   │   ├── chat-suggestions.ts
│   │   ├── client-anime.ts
│   │   ├── creative-video-profiles.ts
│   │   ├── creative-visionary-config.ts
│   │   ├── deck-interactive.ts
│   │   ├── deck-ui-store.ts
│   │   ├── demo-media.ts
│   │   ├── design-tokens.ts
│   │   ├── dev-engine-api.ts
│   │   ├── dev-file-trees.ts
│   │   ├── dev-terminal-telemetry.ts
│   │   ├── dev-terminal-ws.ts
│   │   ├── dev-trio.ts
│   │   ├── dev-workspace-scaffold.ts
│   │   ├── engine-connection.ts
│   │   ├── entertainment-catalog.ts
│   │   ├── entertainment-streaming.ts
│   │   ├── execution-detect.ts
│   │   ├── execution-preview.ts
│   │   ├── gemini.ts
│   │   ├── global-menu-tools.ts
│   │   ├── image-prompt-intelligence.ts
│   │   ├── input-command-menu.ts
│   │   ├── integration-providers.ts
│   │   ├── karachi-analytics-dataset.ts
│   │   ├── live-render-pipeline.ts
│   │   ├── live-stream-api.ts
│   │   ├── live-tv-api.ts
│   │   ├── local-chat-fallback.ts
│   │   ├── maps-api.ts
│   │   ├── marketing-campaign-api.ts
│   │   ├── marketing-campaign-store.ts
│   │   ├── media-context-manager.ts
│   │   ├── media-url.ts
│   │   ├── medical-diagnostic-api.ts
│   │   ├── medical-diagnostic-store.ts
│   │   ├── motion-presets.ts
│   │   ├── music-player-types.ts
│   │   ├── music-tool-api.ts
│   │   ├── navigation-state.ts
│   │   ├── navigation.ts
│   │   ├── omni-tools-api.ts
│   │   ├── omni-tools.ts
│   │   ├── omnicharge-api.ts
│   │   ├── omniforge-api.ts
│   │   ├── omniforge-architect-api.ts
│   │   ├── omniforge-deploy-api.ts
│   │   ├── omniforge-ide-modules.ts
│   │   ├── omniforge-layout-context.tsx
│   │   ├── omniforge-mobile-layout-store.ts
│   │   ├── omniforge-polyglot-registry.ts
│   │   ├── omniforge-preview-data.ts
│   │   ├── omniforge-preview-runtime.ts
│   │   ├── omniforge-project-profile.ts
│   │   ├── omniforge-project-seed.ts
│   │   ├── omniforge-shell-context.tsx
│   │   ├── omniforge-sse.ts
│   │   ├── omniforge-syntax-validation.ts
│   │   ├── omniforge-workspace.tsx
│   │   ├── omnimind-ecosystem-context.tsx
│   │   ├── omnimind-ecosystem-registry.ts
│   │   ├── omnimind-execute-api.ts
│   │   ├── omnimind-ide-config.ts
│   │   ├── omnimovies-api.ts
│   │   ├── omnimusic-api.ts
│   │   ├── omnimusic-taste.ts
│   │   ├── omnistream-api.ts
│   │   ├── omnitv-bigdata-api.ts
│   │   ├── preview-layout-sync.ts
│   │   ├── readiness-api.ts
│   │   ├── responsive-layout.ts
│   │   ├── roman-language.ts
│   │   ├── slash-commands.ts
│   │   ├── sovereign-route-map.ts
│   │   ├── sovereign-tool-api.ts
│   │   ├── sovereign-tool-registry.ts
│   │   ├── spatial-canvas-store.ts
│   │   ├── spatial-engine-api.ts
│   │   ├── spatial-render-store.ts
│   │   ├── staged-attachments.ts
│   │   ├── streaming-events.ts
│   │   ├── supabase.ts
│   │   ├── super-tool-prompt-bus.ts
│   │   ├── super-tools.ts
│   │   ├── superapp.ts
│   │   ├── theme-engine.ts
│   │   ├── tool-routes.ts
│   │   ├── tool-ui-styles.ts
│   │   ├── trading-api.ts
│   │   ├── translate-api.ts
│   │   ├── translator-bridge.ts
│   │   ├── trigger-agent-suggestion.ts
│   │   ├── types.ts
│   │   ├── unified-navigation.ts
│   │   ├── use-dev-engine-workbench.ts
│   │   ├── use-dev-terminal-ws.ts
│   │   ├── use-drag-scroll.ts
│   │   ├── use-medical-diagnostic-sync.ts
│   │   ├── use-spatial-canvas-sync.ts
│   │   ├── useDebouncedValue.ts
│   │   ├── useThrottledCallback.ts
│   │   ├── utils.ts
│   │   ├── video-generation-api.ts
│   │   ├── video-source-api.ts
│   │   ├── visual-context-manager.ts
│   │   ├── workbench-layout.ts
│   │   ├── workbench-live-store.ts
│   │   ├── workbench-pipeline-labels.ts
│   │   ├── workbench-prompt-bridge.ts
│   │   ├── workbench-utility.ts
│   │   └── workbench-zone-store.ts
│   ├── public/
│   │   └── favicon.svg
│   ├── server/
│   │   └── channel-api.js
│   ├── types/
│   │   └── speech.d.ts
│   ├── .env.local
│   ├── .env.local.example
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vercel.json
├── gateway-go/
│   ├── cmd/
│   │   └── gateway/
│   │       └── main.go
│   ├── internal/
│   │   ├── auth/
│   │   │   └── jwt.go
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── grpc/
│   │   ├── http/
│   │   │   └── routes.go
│   │   ├── redis/
│   │   │   └── client.go
│   │   └── ws/
│   │       └── hub.go
│   ├── Dockerfile
│   ├── go.mod
│   └── README.md
├── generated/
│   └── omnimind-app/
│       ├── backend/
│       │   ├── routers/
│       │   │   ├── __init__.py
│       │   │   └── terminal_stream.py
│       │   ├── main.py
│       │   └── requirements.txt
│       ├── frontend/
│       │   ├── app/
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── package.json
│       │   └── tsconfig.json
│       ├── .env.example
│       └── README.md
├── infra/
│   ├── k8s/
│   │   └── omniforge-starter.yaml
│   └── redis/
│       └── README.md
├── performance-cpp/
│   ├── include/
│   │   └── pipeline.hpp
│   ├── src/
│   │   ├── main.cpp
│   │   └── pipeline.cpp
│   └── CMakeLists.txt
├── performance-rust/
│   ├── src/
│   │   ├── compute/
│   │   │   └── trading.rs
│   │   ├── vector/
│   │   │   └── qdrant.rs
│   │   └── main.rs
│   └── Cargo.toml
├── plan text/
│   └── .gitignore
├── scripts/
│   ├── omnimind/
│   │   ├── run-omniforge-local.ps1
│   │   └── smoke-test.ps1
│   ├── fix-elasticsearch-yml.ps1
│   ├── free-port-8001.ps1
│   ├── free-port.ps1
│   ├── generate-tree.py
│   └── restart-backend-8001.ps1
├── services/
│   └── gateway/
│       └── Dockerfile
├── testing/
│   ├── requirements.txt
│   ├── test_endpoints.py
│   ├── test_harness.html
│   └── theme_hub.html
├── .cursorignore
├── .dockerignore
├── .env.docker.example
├── connect-dev.ps1
├── CONNECT-OMNIMIND.ps1
├── DEPLOY.md
├── docker-compose.omniforge.yml
├── docker-compose.streaming.yml
├── docker-compose.yml
├── DOCKER-OMNIMIND.ps1
├── Dockerfile
├── nginx.conf
├── OMNIFORGE_RUNBOOK.md
├── OMNIMIND-START.ps1
├── POLYGLOT_ARCHITECTURE.md
├── run-backend-8000.ps1
├── run-backend-8001.ps1
├── RUN-DEV.bat
├── RUN-DEV.ps1
├── run-frontend.ps1
├── SETUP-PUBLISH.md
├── START-OMNIMIND.ps1
├── TERMINAL-HELP.txt
└── TEST-OMNIMIND.ps1
```

**Ignored:** `node_modules`, `.next`, `.git`, `__pycache__`, `.venv`, `venv`

**Collapsed:** large `backend/data/*` asset folders show item counts only.