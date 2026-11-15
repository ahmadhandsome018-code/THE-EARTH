THE EARTH

Official Project Specification

Project Version: 0.1.0
Documentation Status: Active Development
Project Type: Persistent Multiplayer Open Virtual World
Primary Platforms: Desktop Browsers and Mobile Browsers
Initial Languages: Arabic and English

---

1. Project Vision

THE EARTH is a persistent multiplayer virtual world designed to simulate an interconnected environment where players can live, explore, build, own land, establish businesses, trade, participate in city management, interact socially, and contribute to a player-driven economy.

The world is intended to operate continuously, with persistent player accounts, ownership records, businesses, cities, resources, and economic activity.

The project must be developed incrementally, with each major system tested before progressing to dependent systems.

Core Principles

- Persistent multiplayer world.
- Player-owned land and properties.
- Player-created businesses and projects.
- City governance and public infrastructure.
- Player-driven production and trade.
- Social interaction and proximity voice chat.
- Scalable graphics and performance.
- Server-authoritative ownership and economy.
- Fair anti-fraud and anti-manipulation systems.
- Support for desktop and mobile devices.

---

2. World Structure and Scale

2.1 Land Grid

The initial planned land system contains:

- 5,000,000 purchasable land grid squares.
- Each square measures 5 meters × 5 meters.
- Each square represents 25 square meters.
- Total planned purchasable land area: 125 square kilometers.

This figure describes the planned purchasable grid area, not the total geographical size of the entire world.

The total world area, wilderness distribution, oceans, mountains, and non-purchasable areas remain to be determined.

2.2 Cities

- The initial world is planned to contain 12 cities.
- Cities contain residential, commercial, industrial, agricultural, and public areas.
- City managers control development and city administration within their authority.
- Each city has public infrastructure and government facilities.
- Cities can participate in trade, transportation, alliances, and other inter-city activities.

2.3 First City Manager

The first player who successfully selects and enters an unclaimed city becomes its first historical city manager.

This assignment must be performed through an atomic server-side operation.

The system must prevent two players from simultaneously becoming the first manager of the same city.

2.4 Founders Program

The first 1,000 players globally receive a Founders Badge.

The system must maintain an accurate server-side registration order.

---

3. World Streaming and Technical Architecture

The world must not be loaded entirely at once.

Required Systems

- World coordinates.
- Grid-based land identification.
- Region and sector organization.
- Chunk-based loading and unloading.
- Level of Detail (LOD).
- Distance-based object rendering.
- Memory management.
- Asset streaming.
- Server-authoritative world state.
- Persistent database records.

Chunk loading must allow players to explore large areas without requiring all world assets to remain in memory.

The architecture must support future expansion without requiring a complete redesign of the world system.

---

4. Terrain and Environment

The world is planned to include:

- Mountains.
- Hills.
- Plains.
- Rivers.
- Lakes.
- Oceans.
- Coastlines.
- Forests.
- Agricultural land.
- Natural resources.
- Wildlife habitats.
- Different environmental regions.

Terrain and environmental systems must support future resource production, construction, transportation, and ecological interactions.

---

5. Graphics and Rendering

THE EARTH must support four graphics quality levels:

1. Low
2. Medium
3. High
4. Ultra

5.1 Ultra Graphics

Ultra is an advanced graphics option intended for compatible devices.

It targets highly realistic, photorealistic visual quality.

The intended visual features include:

- High-quality physically based rendering (PBR).
- Detailed materials and textures.
- Advanced lighting.
- Realistic shadows.
- Reflections.
- Detailed water.
- Dense vegetation.
- Detailed buildings.
- Detailed vehicles.
- Realistic environmental effects.
- High-quality character models.

Ultra must only be enabled when the hardware, GPU, browser, and rendering capabilities are suitable.

The system must evaluate device performance before enabling demanding features.

5.2 Rendering Technologies

- WebGPU when supported and suitable.
- WebGL 2 as a compatibility rendering path.
- GPU-based local rendering.
- Adaptive graphics quality.
- Chunk streaming.
- LOD.
- Memory optimization.

Visual quality depends on both rendering technology and the quality of the actual 3D assets.

Ultra quality is an aspirational target, not a guarantee that every device can run it.

5.3 Performance

The game must adapt to:

- GPU capabilities.
- Available memory.
- Device performance.
- Screen resolution.
- Browser capabilities.
- Current scene complexity.

Lower graphics settings must remain playable on less powerful devices.

---

6. Platforms, Controls, and Languages

6.1 Platforms

- Desktop browsers.
- Android browsers.
- iPhone browsers.
- Responsive user interfaces.

6.2 Controls

Desktop controls must support:

- WASD movement.
- Mouse camera control.
- Space for jumping where applicable.
- E for interaction where applicable.
- Esc for menus and interface control.

Mobile controls must provide touch-based movement, camera control, and interaction.

6.3 Camera System

The player must be able to use the supported camera modes.

Camera customization must also be available within the in-game project editor.

6.4 Languages

Initial interface languages:

- Arabic.
- English.

The system must support RTL and LTR layouts and allow additional languages in the future.

---

7. Player Accounts and Persistence

Players must have persistent accounts.

The server must maintain:

- Account identity.
- Player profile.
- Character information.
- Owned land.
- Owned buildings.
- Businesses.
- Inventory.
- PAL balance.
- Contracts.
- Employment information.
- City membership.
- Player status.
- Account security records.

Important transactions and ownership changes must be recorded permanently.

The client must never be trusted as the final authority for balances, ownership, or valuable transactions.

---

8. Player Life and Social Interaction

Players are intended to have a persistent virtual life.

The planned life systems include:

- Health.
- Mood.
- Food.
- Sleep.
- Physical condition.
- Social interaction.
- Environmental effects.
- Weather-related effects.

The exact numerical formulas and balancing rules will be defined during implementation.

---

9. Proximity Voice Chat

9.1 Core Concept

THE EARTH must include proximity-based voice communication.

Players can communicate through voice with other players located near them in the virtual world.

Voice communication is spatially connected to player positions.

9.2 Voice Behavior

- Nearby players can hear one another.
- Voice volume decreases gradually with distance.
- Players outside the configured voice range cannot be heard.
- 3D Spatial Audio must communicate the approximate direction of the speaker.
- Voice communication must not automatically connect players across distant cities.
- Voice range must be configurable by the game system.

9.3 Controls

- Push-to-Talk.
- Optional open microphone mode.
- Microphone mute.
- Individual player volume controls.
- Mute individual players.
- Block individual players.
- Report inappropriate voice behavior.

9.4 Device Support

- Desktop microphone support.
- Mobile microphone support.
- Browser microphone permission requests.
- User-controlled audio settings.

9.5 Technical Requirements

- Low-latency communication.
- Scalable voice infrastructure.
- Spatial audio processing.
- Distance-based attenuation.
- Server-side validation of player proximity.
- Protection against forged client positions.
- Bandwidth and battery optimization.

The client must not independently decide which players are authorized to hear one another.

Voice communication must be validated against server-authoritative player positions and configured range rules.

This feature is planned for the multiplayer and real-time communication implementation stages.

---

10. Land Ownership and Real Estate

10.1 Land Categories

Land may be designated as:

- Residential.
- Commercial.
- Industrial.
- Agricultural.

Land conversion is subject to zoning, infrastructure, permits, and city regulations.

10.2 Ownership

Players may purchase available land and use it to:

- Build.
- Upgrade.
- Develop.
- Sell.
- Resell.
- Establish businesses.

Land area determines the available construction space.

For example, a stadium requires substantially more grid squares than a small shop.

10.3 Building Prices

Buildings may use predefined unit prices or custom pricing.

The system must account for land size, building configuration, and permitted usage.

10.4 Government Land

Government facilities and public infrastructure occupy government-designated land.

Examples include:

- Hospitals.
- Schools.
- Stadiums.
- Airports.
- Other public facilities.

These facilities can only be transferred or acquired through an application and city manager approval.

The government-facility transfer model is separate from ordinary player-to-player real estate transactions.

The approved government-facility transfer arrangement specifies that the transaction is paid in real money to the game developer, while the city receives the equivalent virtual amount.

This is not subject to the ordinary 3% PAL transaction tax.

---

11. Construction and Project Editors

THE EARTH must provide modular construction and project creation tools.

Players must be able to create and customize buildings, businesses, and projects within the rules of the world.

The editor must support:

- Building components.
- Interior customization.
- Project layouts.
- Functional elements.
- Camera customization.
- Configurable behaviors.
- Approved interactions.

Examples include:

- A hardware shop.
- A factory.
- A wrestling business with custom movement and venue camera angles.
- Other player-created businesses.

Some custom behaviors may require city manager approval before publication or activation.

The editor must use controlled and sandboxed systems rather than allowing unrestricted execution of arbitrary code.

---

12. Economy and PAL Currency

12.1 PAL

PAL is the internal virtual currency of THE EARTH.

PAL is used for eligible in-world transactions.

PAL is not a withdrawable currency and must not be convertible into USD or stablecoins.

12.2 PAL Transactions

PAL is intended to be used for:

- Land transactions.
- Real estate.
- Products.
- Services.
- Paid experiences.
- Paid games and activities.
- Other eligible in-world transactions.

12.3 City Tax

A 3% tax applies to eligible PAL transactions.

The tax is allocated to the relevant city treasury.

The previous 10% tax on ordinary commerce and advertising is cancelled.

The 3% PAL tax must not be confused with the 10% commission on official real-money account sales.

12.4 Economic Monitoring

The system must monitor:

- PAL issuance.
- PAL circulation.
- PAL sinks.
- Market liquidity.
- Supply and demand.
- Production.
- Inventory.
- Purchasing power.
- Transaction volume.
- Economic concentration.

The purpose is to maintain economic visibility and support responsible balancing.

---

13. Resources, Production, Agriculture, and Industry

The world economy must include natural resources and player-operated production.

Planned systems include:

- Resource gathering.
- Agriculture.
- Factories.
- Manufacturing.
- Food production.
- Construction materials.
- Transportation resources.
- Resource trade.
- Imports and exports.

Resources may initially be abundant, with scarcity increasing over time depending on extraction, consumption, and production.

Factories and businesses must produce resources according to their capabilities and operating conditions.

Resource prices must follow the intended economic model:

- Prices can be fixed before a production market is established.
- Prices become market-driven when sufficient production and trade exist.

Production and inventory must be persistent.

---

14. Businesses, Jobs, and Contracts

Players can establish businesses and employ other players.

Businesses may include:

- Shops.
- Factories.
- Farms.
- Transportation companies.
- Advertising businesses.
- Other permitted commercial activities.

Business owners can publish job opportunities.

Applicants can review and agree to contract terms through the game's communication system.

Employment contracts must record the agreed conditions.

The system must distinguish business ownership, employment, inventory, production, and financial transactions.

---

15. Offerwalls and Clipping

THE EARTH is planned to include external promotional activity systems.

Players may choose between:

1. Offerwalls.
2. Clipping campaigns.

The game owner receives real revenue from approved campaigns.

Players receive PAL as their in-game reward.

Players do not receive USD directly through these activities.

15.1 Offerwalls

The system targets integration with six Offerwall networks.

Offer availability may vary according to:

- Country.
- Device.
- Campaign eligibility.
- Advertiser restrictions.
- User eligibility.

Rewards must only be credited after a confirmed provider postback.

Technical requirements include:

- Server-side postback verification.
- Idempotency.
- Duplicate-event protection.
- Reversal handling.
- Fraud detection.
- Transaction logging.

15.2 Clipping

Players may create, edit, and publish promotional video clips.

The business or campaign owner benefits from the resulting promotional activity.

The player receives PAL according to the campaign rules.

The game owner receives the campaign's real-money revenue.

15.3 Business-Specific Rewards

Campaigns may provide virtual resources or products to the participating business according to the campaign type and verified results.

Examples:

- Factory campaigns provide specified production resources.
- Farm campaigns provide specified agricultural supplies.
- Shop campaigns provide specified inventory.
- Transportation campaigns provide specified operating resources.

Campaign rewards must be defined in advance and must not be arbitrary.

The resource reward model must be tied to the campaign's declared rules and results.

---

16. Advertising

The world may contain advertising spaces and promotional opportunities.

Planned advertising formats include:

- Public advertising boards.
- In-business advertising.
- Commercial property advertising.
- Advertising contracts.
- Promotional campaigns.

Advertising arrangements must record their contractual terms.

The distribution of revenue from certain public advertising spaces remains unresolved.

The tax treatment of public advertising contracts also remains unresolved.

The cancelled 10% ordinary commerce and advertising tax must not be reintroduced without an explicit new decision.

---

17. Official Account Marketplace

The official marketplace is specifically intended for player-to-player account sales using real money.

The marketplace commission is 10%.

Example:

For a completed account sale worth USD 10,000:

- Seller receives USD 9,000.
- Game operator receives USD 1,000.

Requirements

- Account ownership verification.
- Secure account transfer.
- Login credential updates.
- Revocation of previous sessions.
- Transfer history.
- Transaction records.
- Dispute handling.
- Fraud prevention.
- Refund and chargeback handling.

The official account marketplace is separate from the in-world PAL economy.

Land, products, and ordinary services are traded using PAL under their applicable rules.

The unofficial account marketplace is not an authorized marketplace under the intended game rules.

Investigations into external account trading must use fair evidence-based processes.

IP addresses and device fingerprints are risk signals, not conclusive proof by themselves.

---

18. Market Integrity and Anti-Manipulation

The game must include tools to monitor economic manipulation and suspicious activity.

The approved mechanisms are:

1. Market Analytics.
2. Price Anomaly Detection.
3. Transaction Monitoring.
4. Resource Monitoring.
5. Ownership Tracking.
6. Audit Ledger.
7. Investigation System.
8. Anti-Manipulation Rules.
9. Graduated Penalties.

18.1 Freedom of Pricing

There is no maximum price ceiling for:

- Land.
- Real estate.
- Products.
- Resources.

Players may engage in legitimate speculation and market activity.

A high listing price alone is not proof of wrongdoing.

Unusual price movements are investigation signals, not automatic evidence of a violation.

18.2 Investigations

Investigations must consider relevant evidence, including:

- Transaction history.
- Ownership relationships.
- Repeated transfers.
- Coordinated trading.
- Market patterns.
- Resource movements.
- Account activity.

Penalties must be proportionate and based on evidence and review.

Graduated penalties must be supported by a documented enforcement process.

---

19. City Governance

Each city has a manager responsible for city administration.

The manager's authority includes:

- Development approvals.
- Road planning.
- Street lighting.
- Sidewalks.
- Decorations.
- Public projects.
- City development.
- Approved city staff recruitment.
- City budget oversight.

19.1 Elections

City elections are planned every four in-game years.

One in-game year equals three real-world weeks.

19.2 Manager Removal

A removal petition requires approval from 60% of the relevant residents according to the final eligibility rules.

The precise voting eligibility and quorum calculation remain to be determined.

19.3 City Treasury

The city treasury receives the applicable 3% PAL transaction tax.

City budgets must be monitored.

Public spending may support city development, entertainment, assistance, and other approved projects.

19.4 Public Projects

Cities may establish projects involving players in roles such as:

- Entertainment.
- Guidance.
- Public services.
- Other approved activities.

---

20. Transportation and Inter-City Travel

The world must support transportation networks connecting cities and regions.

Planned systems include:

- Roads.
- Civilian vehicles.
- Commercial vehicles.
- Airports.
- Inter-city travel.
- Transportation fees.
- Logistics and trade routes.

Airports are government-owned travel hubs.

Airport acquisition or transfer follows the government-facility application and approval process.

---

21. Police, Army, and City Security

The game is planned to include police and army roles.

Players may serve in these roles according to the city's rules.

City managers may recruit volunteers or paid staff.

The system may support city defense, conflict, and inter-city security mechanics.

Detailed combat and security rules must be defined during implementation.

---

22. Sports and Recreation

Each city is planned to include starter football fields.

Supported formats include:

- 1v1.
- 3v3.
- 5v5.

Cities may organize leagues and tournaments.

City managers may configure local competition rules within the game framework.

Additional recreational activities may be developed as separate systems.

Standalone mini-games must not automatically be tied to the main economic system.

Separate browser-game-style entertainment products may be offered through hardware shops or other approved businesses.

---

23. Wildlife and Environment

The world is planned to include wildlife and marine life.

Environmental systems may include:

- Habitats.
- Wildlife populations.
- Marine environments.
- Natural resource interactions.
- Weather.
- Environmental changes.

These systems must be developed in a way that supports world performance and persistence.

---

24. Death and Player Lives

The approved player-life model is:

- A player has five lives.
- After losing all five lives, the account enters a 10-day suspension period.
- After the suspension period, the player receives five new lives.
- The player's account and owned property remain preserved.

The exact death conditions and detailed recovery mechanics will be implemented later.

---

25. Maintenance System

THE EARTH must have a separate maintenance page.

The maintenance page must be available when the main game is temporarily unavailable.

It must communicate the maintenance status to players.

---

26. Security and Fair Play

The project must use server-authoritative validation for important operations.

Critical systems include:

- Authentication.
- Account ownership.
- Property ownership.
- Currency balances.
- Marketplace transactions.
- Resource production.
- Campaign rewards.
- City management permissions.
- Voice proximity authorization.

The system must maintain audit records for important economic and administrative actions.

Security and anti-fraud systems must distinguish suspicious indicators from proven violations.

---

27. Development Roadmap

The project is planned in the following major stages.

Stage 1 — Project Foundation

- Repository setup.
- Application entry point.
- Frontend structure.
- Technical environment.
- Initial interface.
- Documentation.

Stage 2 — World Coordinates and Land Grid

- Coordinate system.
- Grid identification.
- Five-million-square land plan.
- Land data model.

Stage 3 — Regions and Sectors

- World regions.
- Sector boundaries.
- Regional organization.

Stage 4 — Chunk Loading

- Loading and unloading.
- Streaming.
- LOD foundations.
- Memory management.

Stage 5 — Terrain

- Mountains.
- Rivers.
- Lakes.
- Plains.
- Coasts.
- Natural environments.

Stage 6 — Roads and Infrastructure

- Roads.
- Lighting.
- Sidewalks.
- Transportation networks.

Stage 7 — Cities and Public Facilities

- Initial cities.
- Government buildings.
- Public facilities.
- City structure.

Stage 8 — Graphics

- Low, Medium, High, and Ultra.
- Materials.
- Lighting.
- Shadows.
- Reflections.
- Performance adaptation.

Stage 9 — Player and Desktop Controls

- Character.
- Movement.
- Camera.
- Desktop interaction.

Stage 10 — Mobile Controls

- Touch controls.
- Mobile camera.
- Responsive gameplay.

Stage 11 — Vehicles

- Civilian vehicles.
- Commercial vehicles.
- Transportation systems.

Stage 12 — Accounts and Persistent Server

- Authentication.
- Database.
- Player persistence.
- Ownership records.

Stage 13 — Multiplayer and Real-Time Communication

- Multiplayer synchronization.
- Real-time player positions.
- Proximity Voice Chat.
- Spatial Audio.
- Voice moderation.
- Scalable communication.

Stage 14 — Land, Real Estate, and Construction

- Ownership.
- Purchases.
- Building.
- Project editors.
- Customization.

Stage 15 — Resources and Production

- Resource collection.
- Agriculture.
- Factories.
- Food.
- Manufacturing.

Stage 16 — PAL Economy and Trade

- PAL balances.
- Transactions.
- Taxation.
- Trade.
- Imports and exports.

Stage 17 — Businesses and Employment

- Shops.
- Companies.
- Jobs.
- Contracts.
- Advertising.
- Official account marketplace.
- Offerwalls and clipping.

Stage 18 — City Management

- Governance.
- Elections.
- Budgets.
- Public projects.
- Maintenance.

Stage 19 — Inter-City Relations and Security

- Trade connections.
- Alliances.
- Police.
- Army.
- Conflicts and defense.

Stage 20 — Life and Social Systems

- Health.
- Food.
- Sleep.
- Weather.
- Wildlife.
- Sports.
- Social activities.
- Final testing and release preparation.

Each stage must have functional tests before dependent systems are considered complete.

---

28. Open Decisions

The following subjects are not finalized and must not be treated as approved technical or economic decisions.

1. Total geographical size of the world beyond the 125 km² purchasable land grid.
2. Exact distribution of regions, oceans, wilderness, and cities.
3. Revenue distribution for public advertising spaces.
4. Tax treatment of public advertising contracts.
5. Exact meaning and structure of the USD 3,000 Creator Program purchase requirement.
6. Selection of the platform used to verify publishing activity across three platforms.
7. Voting eligibility and quorum calculations.
8. Reference value and calculation method for certain products and rewards.
9. Exact resource rewards for each campaign type.
10. Detailed technical provider and infrastructure choices for voice communication.
11. Detailed numerical balancing of life, health, production, and economic systems.

These decisions require explicit approval before implementation.

---

29. Implementation Status

This document describes the intended project.

Documentation does not mean that a feature has already been implemented.

A feature is considered implemented only after:

1. Its code has been added.
2. Its required backend and data systems exist.
3. Its functionality has been tested.
4. Its security requirements have been checked.
5. Its acceptance criteria have been met.

THE EARTH — Build the world step by step.
