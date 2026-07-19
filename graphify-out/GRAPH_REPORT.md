# Graph Report - .  (2026-07-19)

## Corpus Check
- 347 files · ~339,044 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1977 nodes · 3418 edges · 191 communities (112 shown, 79 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 210 edges (avg confidence: 0.77)
- Token cost: 8,500 input · 4,200 output

## Community Hubs (Navigation)
- UI Navigation & Layout
- Design Token Primitives
- Home Dashboard Components
- CIP Design Scripts
- UI Documentation
- Server Notifications & Points
- Slide Search Engine
- Server Database & Seeding
- Server API Controllers
- Route Tree Generation
- Server Admin API
- Server Entry & Middleware
- Brand & Design Skills
- Tailwind Config Tests
- HTML Token Validator
- UI Styling References
- Manager Pick Team
- Gameweek Pitch View
- Head-to-Head Feature
- Home Feature Types
- Server Auth & H2H
- Server Sync & Fantasy Team
- Logo Search Engine
- UI Package Dependencies
- Server Lineup & Substitution
- Player Detail Components
- UI Dev Dependencies
- Design Token Spacing
- Manager API & Admin Routes
- Gameweek Navigation
- Admin Fantasy Team Routes
- Slides Skill References
- Slide Generator Scripts
- Tailwind Config Gen Tests
- Design Token Semantic Colors
- Tailwind Config Generator
- Server Package Dependencies
- Player Stats Feature
- CIP & Logo Design References
- Background Fetch Scripts
- Homepage Screenshot Analysis
- Design System Generator
- Standings Table Components
- Route Definitions
- App Entry & Theme Context
- Icon Generator Scripts
- Design Token Font Sizes
- Shadcn Installer Tests
- Design System Orchestration
- Server Dev Dependencies
- Player Info Components
- Server TypeScript Config
- Notifications Feature
- Team Details Page
- Standings Page
- Design Token Radius & Shadows
- UI UX Color Sync
- Sofascore Scraper Scripts
- Design Token Schema
- Shadcn Installer
- UI Package Config
- Auth Feature (Login)
- Design Token Component Tokens
- Shadcn Installer Edge Cases
- Server Package Scripts
- Tailwind Config Gen Validation
- UI UX Core Search
- Logo Generate Scripts
- Design Token Button Tokens
- Design Token Duration
- Tailwind Config Generator Core
- Football API Service
- Substitution Update Helpers
- Color Utility Helpers
- Token Validation Tests
- UI UX BM25 Search
- Banner & Social Design Refs
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 149
- Community 150
- Community 151
- Community 152
- Community 153
- Community 154
- Community 155
- Community 156
- Community 157
- Community 158
- Community 159
- Community 160
- Community 161
- Community 162
- Community 163
- Community 164
- Community 165
- Community 166
- Community 167
- Community 168
- Community 169
- Community 170
- Community 171
- Community 172
- Community 176
- Community 177
- Community 178
- Community 179
- Community 180
- Community 181
- Community 182
- Community 183
- Community 184
- Community 185
- Community 187
- Community 188
- Community 189

## God Nodes (most connected - your core abstractions)
1. `TailwindConfigGenerator` - 57 edges
2. `error` - 54 edges
3. `Player` - 38 edges
4. `TestTailwindConfigGenerator` - 35 edges
5. `ShadcnInstaller` - 33 edges
6. `FantasyTeam` - 27 edges
7. `TestShadcnInstaller` - 26 edges
8. `FileRoutesByPath` - 25 edges
9. `Gameweek` - 22 edges
10. `Team` - 22 edges

## Surprising Connections (you probably didn't know these)
- `AdminNotifications()` --indirect_call--> `error`  [INFERRED]
  ui/src/routes/admin/notifications.lazy.tsx → server/src/types/error.ts
- `GW Data Sync Verification Output` --semantically_similar_to--> `Players Feature`  [INFERRED] [semantically similar]
  server/verify_output_final.txt → ui/DOCUMENTATION.md
- `useSubstitution()` --indirect_call--> `substitution()`  [INFERRED]
  ui/src/features/manager/hooks.ts → server/src/controllers/manager.ts
- `PWAInstallBanner()` --indirect_call--> `error`  [INFERRED]
  ui/src/components/PWAInstallBanner.tsx → server/src/types/error.ts
- `UpdatePrompt()` --indirect_call--> `error`  [INFERRED]
  ui/src/components/UpdatePrompt.tsx → server/src/types/error.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brand Guidelines Document Family** — agents_skills_brand_references_brand_guideline_template, agents_skills_brand_references_color_palette_management, agents_skills_brand_references_typography_specifications, agents_skills_brand_references_logo_usage_rules, agents_skills_brand_references_voice_framework, agents_skills_brand_templates_brand_guidelines_starter [EXTRACTED 1.00]
- **Design System Token Pipeline** — agents_skills_design_system_skill, agents_skills_brand_skill, agents_skills_brand_references_update, agents_skills_design_system_references_tailwind_integration, concept_three_layer_token_architecture [EXTRACTED 0.95]
- **Accessibility Compliance Framework** — concept_wcag_accessibility, agents_skills_brand_references_color_palette_management, agents_skills_brand_references_typography_specifications, agents_skills_brand_references_approval_checklist, agents_skills_design_system_references_states_and_variants [INFERRED 0.85]
- **Slides Knowledge Base** — _agents_skills_design_references_slides_create, _agents_skills_design_references_slides_layout_patterns, _agents_skills_design_references_slides_html_template, _agents_skills_design_references_slides_copywriting_formulas, _agents_skills_design_references_slides_strategies [EXTRACTED 1.00]
- **CIP Reference Documents** — _agents_skills_design_references_cip_deliverable_guide, _agents_skills_design_references_cip_style_guide, _agents_skills_design_references_cip_prompt_engineering [EXTRACTED 1.00]
- **Logo Reference Documents** — _agents_skills_design_references_logo_style_guide, _agents_skills_design_references_logo_color_psychology, _agents_skills_design_references_logo_prompt_engineering [EXTRACTED 1.00]
- **Slides Skill System** — .agents_skills_slides_references_create_slides_skill, .agents_skills_slides_references_html_template_slides_html_template, .agents_skills_slides_references_layout_patterns_slide_layouts, .agents_skills_slides_references_slide_strategies_deck_strategies [EXTRACTED 1.00]
- **UI Styling Reference Stack** — .agents_skills_ui_styling_skill_ui_styling_skill, .agents_skills_ui_styling_references_shadcn_components_shadcn_component_catalog, .agents_skills_ui_styling_references_shadcn_theming_shadcn_theming, .agents_skills_ui_styling_references_shadcn_accessibility_radix_ui_a11y, .agents_skills_ui_styling_references_tailwind_utilities_tailwind_utility_reference, .agents_skills_ui_styling_references_tailwind_responsive_responsive_design, .agents_skills_ui_styling_references_tailwind_customization_tailwind_config [EXTRACTED 1.00]
- **Canvas Design Movements** — .agents_skills_ui_styling_references_canvas_design_system_canvas_design, .agents_skills_ui_styling_references_canvas_design_system_concrete_poetry, .agents_skills_ui_styling_references_canvas_design_system_chromatic_language, .agents_skills_ui_styling_references_canvas_design_system_geometric_silence [EXTRACTED 1.00]
- **Responsive grid layout system** — ui_src_pages_home_homepagepng_screenshot, ui_src_pages_home_homepagepng_teamoverview, ui_src_pages_home_homepagepng_upcomingfixture, ui_src_pages_home_homepagepng_leaguestatistics, ui_src_pages_home_homepagepng_gameweekprogress, ui_src_pages_home_homepagepng_leaguestandings, ui_src_pages_home_homepagepng_playerspotlight, ui_src_pages_home_homepagepng_topplayers, ui_src_pages_home_homepagepng_bestperformers, ui_src_pages_home_homepagepng_recentgameweeks, ui_src_pages_home_homepagepng_pointsbreakdown, ui_src_pages_home_homepagepng_seasonstats, ui_src_pages_home_homepagepng_teamformation, ui_src_pages_home_homepagepng_squadvalue, ui_src_pages_home_homepagepng_yourplayerscard, ui_src_pages_home_homepagepng_fantasynews [INFERRED 0.90]
- **Dark theme design system** — ui_src_pages_home_homepagepng_screenshot, ui_src_pages_home_homepagepng_header, ui_src_pages_home_homepagepng_bottomnavbar [INFERRED 0.90]

## Communities (191 total, 79 thin omitted)

### Community 0 - "UI Navigation & Layout"
Cohesion: 0.06
Nodes (29): AdminFixturesIcon(), AdminH2HIcon(), AdminLeaguesIcon(), AdminSettingsIcon(), AdminTeamsIcon(), H2HIcon(), HomeIcon(), LeagueIcon() (+21 more)

### Community 1 - "Design Token Primitives"
Cohesion: 0.05
Nodes (53): $type, $value, $type, $value, $type, $value, $type, $value (+45 more)

### Community 2 - "Home Dashboard Components"
Cohesion: 0.09
Nodes (28): FantasyNews(), calcCountdown(), calcPercent(), GameweekProgress(), LeagueStandings(), LeagueStatistics(), PlayerListCard(), barColor() (+20 more)

### Community 3 - "CIP Design Scripts"
Cohesion: 0.06
Nodes (42): BM25, detect_domain(), get_cip_brief(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection (+34 more)

### Community 4 - "UI Documentation"
Cohesion: 0.05
Nodes (47): GW Data Sync Verification Output, WPL Fantasy League UI Documentation, UI API Layer, API Client (Axios), API Endpoints and Query Keys, Auth Feature, Axios HTTP Client, BottomNavbar Component (+39 more)

### Community 5 - "Server Notifications & Points"
Cohesion: 0.08
Nodes (32): Cell, notifications(), Row, send(), subscribe(), webpush, countCards(), countGoalsConceded() (+24 more)

### Community 6 - "Slide Search Engine"
Cohesion: 0.08
Nodes (36): format_context(), format_result(), main(), Format a single search result for display, Format contextual recommendations for display., BM25, calculate_pattern_break(), detect_domain() (+28 more)

### Community 7 - "Server Database & Seeding"
Cohesion: 0.12
Nodes (30): connectDB(), ILeague, League, LeagueSchema, ISeason, Season, SeasonSchema, DATA_DIR (+22 more)

### Community 8 - "Server API Controllers"
Cohesion: 0.14
Nodes (29): dashboard(), details(), myFixtures(), substitution(), aggregateMatchStats(), getFilters(), getFullPlayerStats(), getPlayerStats() (+21 more)

### Community 9 - "Route Tree Generation"
Cohesion: 0.05
Nodes (36): Route, Route, AdminFantasyTeamsCreateRoute, AdminFantasyTeamsEditTeamIdRoute, AdminFantasyTeamsIndexRoute, AdminFantasyTeamsRoute, AdminFantasyTeamsRouteChildren, AdminFantasyTeamsRouteWithChildren (+28 more)

### Community 10 - "Server Admin API"
Cohesion: 0.16
Nodes (32): completeGameweek(), createFantasyTeam(), createGameweek(), deleteH2HLeague(), fetchLeagueRounds(), generateH2HFixtures(), getAdminPlayers(), getFantasyTeamById() (+24 more)

### Community 11 - "Server Entry & Middleware"
Cohesion: 0.09
Nodes (23): SheetController, app, auth, cors, credentials, fs, { google }, sheets (+15 more)

### Community 12 - "Brand & Design Skills"
Cohesion: 0.14
Nodes (31): Banner Sizes & Art Direction Styles Reference, Banner Design Skill, Asset Approval Checklist, Asset Organization Guide, Brand Guideline Template, Color Palette Management, Brand Consistency Checklist, Logo Usage Rules (+23 more)

### Community 13 - "Tailwind Config Tests"
Cohesion: 0.07
Nodes (15): Test adding colors multiple times., Test adding full color palette., Test adding custom spacing., Test TailwindConfigGenerator class., Test that adding same plugin twice doesn't duplicate., Test plugin recommendations for Next.js., Test initialization with default settings., Test generating config with custom colors. (+7 more)

### Community 14 - "HTML Token Validator"
Cohesion: 0.14
Nodes (24): get_context(), is_allowed_exception(), is_allowed_rgba(), is_inside_block(), load_css_variables(), main(), print_result(), print_summary() (+16 more)

### Community 15 - "UI Styling References"
Cohesion: 0.07
Nodes (27): Apache License 2.0, Canvas Design System, Chromatic Language, Concrete Poetry, Design Philosophy, Geometric Silence, Color Contrast, Keyboard Navigation (+19 more)

### Community 16 - "Manager Pick Team"
Cohesion: 0.19
Nodes (21): useManagerDetails(), useSubstitution(), benchSwap(), canSwap(), Category, clearSwapHighlights(), countStartingPlayers(), EnrichedPlayer (+13 more)

### Community 17 - "Gameweek Pitch View"
Cohesion: 0.16
Nodes (16): getPlayerLeft(), getPositionStyle(), GWPitch(), GWPitchProps, formatKey(), GWPlayerList(), GWPlayerListProps, Player (+8 more)

### Community 18 - "Head-to-Head Feature"
Cohesion: 0.15
Nodes (19): h2hApi, useAdminH2HLeague(), useAdminH2HLeagueFixtures(), useH2HLeagueFixtures(), useH2HStandings(), useMyH2HLeagues(), H2HFixture, H2HLeague (+11 more)

### Community 19 - "Home Feature Types"
Cohesion: 0.09
Nodes (22): homeApi, homeQueries, BestPerformer, FixtureDifficultyItem, FixturePlayer, GameweekHistory, GameweekProgress, HomePageData (+14 more)

### Community 20 - "Server Auth & H2H"
Cohesion: 0.11
Nodes (19): client, login(), privateKey, computeTeamGWPoints(), getH2HLeagueFixturesPublic(), getH2HStandings(), getLeagueAllGWPoints(), getLeagueGWPoints() (+11 more)

### Community 21 - "Server Sync & Fantasy Team"
Cohesion: 0.10
Nodes (20): CREDENTIALS_PATH, SCOPES, SyncController, FantasyTeamSchema, HistorySchema, IFantasyTeam, IHistory, IPick (+12 more)

### Community 22 - "Logo Search Engine"
Cohesion: 0.11
Nodes (19): BM25, detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search across all domains and combine results (+11 more)

### Community 23 - "UI Package Dependencies"
Cohesion: 0.08
Nodes (25): lucide-react, react-dom, @react-oauth/google, @tanstack/react-query, @tanstack/react-query-devtools, @tanstack/react-router, @tanstack/react-router-devtools, dependencies (+17 more)

### Community 24 - "Server Lineup & Substitution"
Cohesion: 0.15
Nodes (18): Formation, FormationResult, Player, RoleKey, canSwap(), Category, countStartingPlayers(), EnrichedPlayer (+10 more)

### Community 25 - "Player Detail Components"
Cohesion: 0.16
Nodes (13): Button(), ButtonProps, CheckboxProps, Header(), HeaderProps, getPointsImpact(), PlayerDetails(), PlayerOverall() (+5 more)

### Community 26 - "UI Dev Dependencies"
Cohesion: 0.09
Nodes (23): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, postcss, tailwindcss, @tailwindcss/vite (+15 more)

### Community 27 - "Design Token Spacing"
Cohesion: 0.09
Nodes (22): $type, $value, $type, $value, $type, $value, $type, $value (+14 more)

### Community 28 - "Manager API & Admin Routes"
Cohesion: 0.17
Nodes (11): API_ENDPOINTS, QUERY_KEYS, managerApi, managerQueries, SubstitutionRequest, SubstitutionResponse, Route, RoundModalProps (+3 more)

### Community 29 - "Gameweek Navigation"
Cohesion: 0.11
Nodes (8): GWNavigationProps, AngleLeftProps, AngleRightProps, ArrowRight(), Group(), ManagerPointsCardsProps, ManagerStatsCardProps, ManagerDetailsResponse

### Community 30 - "Admin Fantasy Team Routes"
Cohesion: 0.12
Nodes (10): apiClient, AdminPlayer, FantasyTeamFormProps, Route, Route, Route, AdminFixtures(), getWeekRange() (+2 more)

### Community 31 - "Slides Skill References"
Cohesion: 0.13
Nodes (20): Slides Reference, Slides Copywriting Formulas, AIDA Formula, Before-After-Bridge Formula, Cost of Inaction Formula, FAB Formula, Formula-to-Slide Mapping, PAS Formula (+12 more)

### Community 32 - "Slide Generator Scripts"
Cohesion: 0.15
Nodes (19): _e(), generate_chart_slide(), generate_cta_slide(), generate_deck(), generate_metrics_slide(), generate_problem_slide(), generate_solution_slide(), generate_testimonial_slide() (+11 more)

### Community 33 - "Tailwind Config Gen Tests"
Cohesion: 0.10
Nodes (11): Generate Tailwind CSS configuration files., Add full color palette (50-950 shades) for a base color.          Args:, TailwindConfigGenerator, Test adding custom fonts., Test validating valid configuration., Test generating complete TypeScript configuration., Test initialization with different frameworks., Test default output path for TypeScript. (+3 more)

### Community 34 - "Design Token Semantic Colors"
Cohesion: 0.11
Nodes (19): $type, $value, background, foreground, muted-foreground, primary, primary-hover, secondary (+11 more)

### Community 35 - "Tailwind Config Generator"
Cohesion: 0.11
Nodes (10): main(), Add custom font families.          Args:             fonts: Dict of font_type: [, Add custom spacing values.          Args:             spacing: Dict of name: val, Add custom breakpoints.          Args:             breakpoints: Dict of name: wi, Add plugin requirements.          Args:             plugins: List of plugin name, Get plugin recommendations based on configuration.          Returns:, Generate configuration file content.          Returns:             Configuration, Write configuration to file.          Returns:             Tuple of (success, me (+2 more)

### Community 36 - "Server Package Dependencies"
Cohesion: 0.11
Nodes (19): bcryptjs, body-parser, cors, dotenv, google-auth-library, mongoose, dependencies, bcryptjs (+11 more)

### Community 37 - "Player Stats Feature"
Cohesion: 0.19
Nodes (12): Overlay(), playersApi, usePlayerFilters(), usePlayers(), playersQueries, PaginatedResponse, PlayerFilterOptions, PlayerFilters (+4 more)

### Community 38 - "CIP & Logo Design References"
Cohesion: 0.12
Nodes (18): CIP Deliverable Guide, CIP Design Reference, CIP Brief Workflow, CIP Deliverable Categories, CIP Mockup Prompt Engineering, CIP Base Prompt Structure, CIP Design Style Guide, CIP Color Psychology (+10 more)

### Community 39 - "Background Fetch Scripts"
Cohesion: 0.17
Nodes (17): generate_css_for_background(), get_background_image(), get_curated_images(), get_overlay_css(), get_pexels_search_url(), load_backgrounds_config(), load_brand_colors(), main() (+9 more)

### Community 40 - "Homepage Screenshot Analysis"
Cohesion: 0.18
Nodes (18): Best Performers Card, Mobile Bottom Navigation Bar, Fantasy News Card, GameweekProgress Card, App Header Bar, LeagueStandings Card, LeagueStatistics Card, PlayerSpotlight Card (+10 more)

### Community 41 - "Design System Generator"
Cohesion: 0.16
Nodes (9): DesignSystemGenerator, Select best matching result based on priority keywords., Extract results list from search result dict., Generate complete design system recommendation., Generates design system recommendations from aggregated searches., Load reasoning rules from CSV., Execute searches across multiple domains., Find matching reasoning rule for a category. (+1 more)

### Community 42 - "Standings Table Components"
Cohesion: 0.14
Nodes (8): AngleDownProps, AngleUpProps, Neutral(), NeutralProps, DEFAULT_HEADINGS, Heading, ScrollableTableProps, Standings

### Community 43 - "Route Definitions"
Cohesion: 0.12
Nodes (8): Route, Route, Route, Route, Route, Route, Route, FileRoutesByPath

### Community 44 - "App Entry & Theme Context"
Cohesion: 0.14
Nodes (12): UpdatePrompt(), IMPORTANT: Increment this version number with each major deployment, VersionCheck(), ThemeContext, ThemeContextType, ThemeProvider(), ThemeProviderProps, queryClient (+4 more)

### Community 45 - "Icon Generator Scripts"
Cohesion: 0.20
Nodes (15): apply_color(), apply_viewbox_size(), extract_svgs(), generate_batch(), generate_icon(), generate_sizes(), load_env(), main() (+7 more)

### Community 46 - "Design Token Font Sizes"
Cohesion: 0.12
Nodes (16): $type, $value, $type, $value, $type, $value, $type, $value (+8 more)

### Community 47 - "Shadcn Installer Tests"
Cohesion: 0.12
Nodes (9): Test adding components without shadcn config., Test adding components that are already installed., Test ShadcnInstaller class., Test adding all components in dry run mode., Create temporary project structure., Test successful addition of all components., Test listing installed components when none exist., Test checking for non-existent shadcn config. (+1 more)

### Community 48 - "Design System Orchestration"
Cohesion: 0.19
Nodes (14): _detect_page_type(), format_markdown(), format_master_md(), format_page_override_md(), generate_design_system(), _generate_intelligent_overrides(), persist_design_system(), Generate intelligent overrides based on page type using layered search. (+6 more)

### Community 49 - "Server Dev Dependencies"
Cohesion: 0.13
Nodes (15): nodemon, devDependencies, nodemon, ts-node, ts-node-dev, @types/express, @types/jsonwebtoken, @types/node (+7 more)

### Community 50 - "Player Info Components"
Cohesion: 0.20
Nodes (12): react, react, PlayerInfo(), DEFAULT_HEADINGS, Heading, PlayersScrollableTable(), PlayersScrollableTableProps, PlayerStats (+4 more)

### Community 51 - "Server TypeScript Config"
Cohesion: 0.13
Nodes (14): node_modules, src/**/*, compilerOptions, allowJs, esModuleInterop, forceConsistentCasingInFileNames, module, outDir (+6 more)

### Community 52 - "Notifications Feature"
Cohesion: 0.28
Nodes (8): notificationApi, useNotifications(), useSubscribe(), notificationsQueries, Keys, Notifications, SubscribeRequest, Notifications()

### Community 53 - "Team Details Page"
Cohesion: 0.23
Nodes (9): PitchPlayerCard(), PitchPlayerCardProps, useTeamDetails(), getPlayerDisplayPrice(), PlayerStatsModal(), TeamDetailsPage(), ViewTransitionConfig, ViewTransitions (+1 more)

### Community 54 - "Standings Page"
Cohesion: 0.24
Nodes (10): useMyFixtures(), standingsApi, useStandings(), useStandingsFixtures(), standingsQueries, getManagerName(), getTeamIcon(), MOCK_MANAGERS (+2 more)

### Community 55 - "Design Token Radius & Shadows"
Cohesion: 0.19
Nodes (14): $type, $value, $type, $value, $type, $value, primitive, radius (+6 more)

### Community 56 - "UI UX Color Sync"
Cohesion: 0.29
Nodes (13): blend(), derive_row(), derive_ui_reasoning(), h2r(), is_dark(), lum(), on_color(), r2h() (+5 more)

### Community 57 - "Sofascore Scraper Scripts"
Cohesion: 0.21
Nodes (12): fs, DATA_DIR, delay(), main(), saveJSON(), TOURNAMENT_SEASONS, {
    launchWarmSession,
    fetchSofascoreJSON
}, path (+4 more)

### Community 58 - "Design Token Schema"
Cohesion: 0.15
Nodes (12): component, $type, $value, dark, semantic, $schema, $type, $value (+4 more)

### Community 59 - "Shadcn Installer"
Cohesion: 0.22
Nodes (7): main(), Add all available shadcn/ui components.          Args:             overwrite: If, List installed components.          Returns:             Tuple of (success, mess, Check if shadcn is initialized in project.          Returns:             True if, Get list of already installed components.          Returns:             List of, Read shadcn version from project package.json; fall back to a pinned default., Add shadcn/ui components.          Args:             components: List of compone

### Community 60 - "UI Package Config"
Cohesion: 0.15
Nodes (12): name, overrides, vite, private, scripts, build, dev, generate-pwa-assets (+4 more)

### Community 61 - "Auth Feature (Login)"
Cohesion: 0.29
Nodes (8): authApi, useLogin(), authQueries, LoginRequest, LoginResponse, User, ValidateResponse, LoginPage()

### Community 62 - "Design Token Component Tokens"
Cohesion: 0.20
Nodes (12): $type, $value, bg, bg, padding, shadow, card, bg (+4 more)

### Community 63 - "Shadcn Installer Edge Cases"
Cohesion: 0.17
Nodes (7): Handle shadcn/ui component installation., ShadcnInstaller, Test component addition with subprocess error., Test listing installed components when they exist., Test initialization with custom project root., Test checking for existing shadcn config., Test getting installed components without config.

### Community 64 - "Server Package Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, prebuild, seed:fixtures, seed:leagues, seed:player-images, seed:players (+4 more)

### Community 65 - "Tailwind Config Gen Validation"
Cohesion: 0.20
Nodes (7): Tests for tailwind_config_gen.py, Reduce a generated TS/JS config to a bare assignable object so it can be     han, Regression guard for the missing-comma bug between the ``theme`` block and     `, The property preceding ``plugins`` must end with a comma (pure-Python         ch, The emitted config parses as valid JS via ``node --check``., _strip_to_object(), TestGeneratedConfigIsValidJs

### Community 66 - "UI UX Core Search"
Cohesion: 0.25
Nodes (10): detect_domain(), _load_csv(), Load CSV and return list of dicts, Core search function using BM25, Auto-detect the most relevant domain from query, Main search function with auto-domain detection, Search stack-specific guidelines, search() (+2 more)

### Community 67 - "Logo Generate Scripts"
Cohesion: 0.29
Nodes (9): enhance_prompt(), generate_batch(), generate_logo(), load_env(), main(), Enhance the logo prompt with style and industry modifiers, Generate a logo using Gemini models with image generation      Args:         asp, Generate multiple logo variants with different styles (+1 more)

### Community 68 - "Design Token Button Tokens"
Cohesion: 0.20
Nodes (10): fg, font-size, hover-bg, button, $type, $value, $type, $value (+2 more)

### Community 69 - "Design Token Duration"
Cohesion: 0.20
Nodes (10): fast, normal, slow, $type, $value, $type, $value, duration (+2 more)

### Community 70 - "Tailwind Config Generator Core"
Cohesion: 0.22
Nodes (6): Path, Initialize generator.          Args:             typescript: If True, generate ., Determine default output path., Create base configuration structure., Get default content paths for framework., Any

### Community 71 - "Football API Service"
Cohesion: 0.29
Nodes (5): getMatchIncidentsAndStats(), getFixtures(), Fixture, router, fetchFixturesByDate()

### Community 72 - "Substitution Update Helpers"
Cohesion: 0.22
Nodes (9): buildSquadRows(), InputData, OutputRow, Player, Position, PosLetter, posToLetter, roleOf() (+1 more)

### Community 73 - "Color Utility Helpers"
Cohesion: 0.31
Nodes (7): Info(), InfoProps, ListPlayerItem(), ListPlayerItemProps, getContrastText(), luminance(), parseHex()

### Community 74 - "Token Validation Tests"
Cohesion: 0.28
Nodes (8): Path, Regression tests for validate-tokens.cjs.  The validator used to skip any line c, A hardcoded hex on the same line as a var() token is still a violation., A line that references only tokens produces no false positives., _run(), test_flags_hardcoded_hex_sharing_line_with_token(), test_token_only_line_reports_no_violation(), CompletedProcess

### Community 75 - "UI UX BM25 Search"
Cohesion: 0.28
Nodes (5): BM25, BM25 ranking algorithm for text search, Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query

### Community 76 - "Banner & Social Design Refs"
Cohesion: 0.32
Nodes (8): Banner Sizes & Styles Reference, 22 Art Direction Styles, CTA Rules, Safe Zones, Visual Hierarchy 3-Zone Rule, Social Photos Design Guide, Social Photos HTML Template, Social Platform Sizes

### Community 77 - "Community 77"
Cohesion: 0.29
Nodes (8): padding-x, input, $type, $value, focus-ring, padding-x, $type, $value

### Community 78 - "Community 78"
Cohesion: 0.29
Nodes (4): Generate TypeScript configuration., Generate JavaScript configuration., Format plugins array for config.          Validates each plugin name against a s, Add indentation to JSON string.

### Community 79 - "Community 79"
Cohesion: 0.25
Nodes (8): ansi_ljust(), format_ascii_box(), hex_to_ansi(), Convert hex color to ANSI True Color swatch (██) with fallback., Like str.ljust but accounts for zero-width ANSI escape sequences., Create a Unicode section separator: ├─── NAME ───...┤, Format design system as Unicode box with ANSI color swatches., section_header()

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (7): detectContentType(), EXTENSION_MAP, keyParts, MAGIC_BYTES, StealthPlugin, supabase, uploadTeamLogos()

### Community 81 - "Community 81"
Cohesion: 0.36
Nodes (5): FixtureDetails(), incidentIcon(), incidentLabel(), Route, statusDisplay()

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (6): author, description, license, main, name, version

### Community 84 - "Community 84"
Cohesion: 0.40
Nodes (5): slides, Chart.js Integration, Slide Animation Classes, Slide Navigation, HTML Slide Template

### Community 85 - "Community 85"
Cohesion: 0.60
Nodes (5): $type, $value, border, border, border

### Community 86 - "Community 86"
Cohesion: 0.60
Nodes (5): radius, radius, radius, $type, $value

### Community 87 - "Community 87"
Cohesion: 0.60
Nodes (5): lg, $type, $value, lg, lg

### Community 88 - "Community 88"
Cohesion: 0.60
Nodes (5): sm, sm, sm, $type, $value

### Community 89 - "Community 89"
Cohesion: 0.40
Nodes (4): ..\\..\\..\\..\\..\\src\\index.ts, ..\\..\\..\\..\\..\\tsconfig.json, extends, include

### Community 91 - "Community 91"
Cohesion: 0.50
Nodes (4): Icon Design Reference, Icon Design 12 Categories, Icon Design 15 Styles, SVG Best Practices

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (4): padding-y, padding-y, $type, $value

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (4): xl, xl, $type, $value

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (4): $type, $value, none, none

### Community 95 - "Community 95"
Cohesion: 0.50
Nodes (3): Action, appShellHandler, PushPayload

### Community 96 - "Community 96"
Cohesion: 0.67
Nodes (3): Card Variants, Layout Selection by Use Case, Slide Layout Patterns

### Community 97 - "Community 97"
Cohesion: 0.67
Nodes (3): Slide Deck Strategies, Duarte Sparkline Pattern, Emotion Arc

### Community 100 - "Community 100"
Cohesion: 0.67
Nodes (3): $type, $value, 16

### Community 101 - "Community 101"
Cohesion: 0.67
Nodes (3): $type, $value, 4

### Community 102 - "Community 102"
Cohesion: 0.67
Nodes (3): $type, $value, 6

### Community 103 - "Community 103"
Cohesion: 0.67
Nodes (3): $type, $value, 8

### Community 104 - "Community 104"
Cohesion: 0.67
Nodes (3): destructive, $type, $value

### Community 105 - "Community 105"
Cohesion: 0.67
Nodes (3): destructive-foreground, $type, $value

### Community 106 - "Community 106"
Cohesion: 0.67
Nodes (3): muted, $type, $value

### Community 107 - "Community 107"
Cohesion: 0.67
Nodes (3): primary-foreground, $type, $value

### Community 108 - "Community 108"
Cohesion: 0.67
Nodes (3): ring, $type, $value

### Community 109 - "Community 109"
Cohesion: 0.67
Nodes (3): secondary-foreground, $type, $value

## Knowledge Gaps
- **487 isolated node(s):** `$schema`, `$value`, `$type`, `$value`, `$type` (+482 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **79 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `error` connect `Server Admin API` to `UI Navigation & Layout`, `Server Database & Seeding`, `Server API Controllers`, `Server Entry & Middleware`, `App Entry & Theme Context`, `Server Auth & H2H`, `Server Sync & Fantasy Team`, `Sofascore Scraper Scripts`, `Manager API & Admin Routes`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `substitution()` connect `Server API Controllers` to `Server Lineup & Substitution`, `Manager Pick Team`, `Server Admin API`, `Server Sync & Fantasy Team`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `useSubstitution()` connect `Manager Pick Team` to `Server API Controllers`, `Manager API & Admin Routes`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 36 inferred relationships involving `TailwindConfigGenerator` (e.g. with `TestGeneratedConfigIsValidJs` and `.test_node_check_parses_generated_config()`) actually correct?**
  _`TailwindConfigGenerator` has 36 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `error` (e.g. with `completeGameweek()` and `createFantasyTeam()`) actually correct?**
  _`error` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `ShadcnInstaller` (e.g. with `TestShadcnInstaller` and `.test_add_all_components_dry_run()`) actually correct?**
  _`ShadcnInstaller` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Regression test for sync-brand-to-tokens.cjs.  The color parser required a paren`, `Resolve token reference like {primitive.color.ocean-blue.500} to hex value.`, `Load colors from assets/design-tokens.json for overlay gradients.      Resolves` to the rest of the system?**
  _717 weakly-connected nodes found - possible documentation gaps or missing edges._