THE EARTH — Changelog

All notable project changes are recorded in this file.

The changelog describes project decisions, documentation changes, implementation milestones, and important corrections.

Documentation updates must not be interpreted as proof that a feature has been implemented.

---

Version 0.1.0 — Project Foundation

Project Structure

- Established the THE EARTH project identity.
- Defined the project as a persistent multiplayer open virtual world.
- Established the initial frontend project structure.
- Added the React application entry point.
- Established the Vite development and build environment.
- Established the Arabic and English interface direction.

World Scale

- Defined an initial plan of 5,000,000 purchasable land grid squares.
- Defined each square as 5 × 5 meters.
- Defined the planned purchasable land area as 125 km².
- Clarified that this is not the total size of the entire world.
- Established a plan for 12 initial cities.

City Founding

- Defined the first successful player to enter an unclaimed city as its first historical city manager.
- Required server-side atomic assignment to prevent duplicate first-manager claims.
- Defined the Founders Badge for the first 1,000 players globally.

Graphics

- Established four graphics settings:
  - Low.
  - Medium.
  - High.
  - Ultra.
- Defined Ultra as an advanced option subject to device and GPU compatibility.
- Established photorealistic visual quality as the long-term Ultra target.
- Defined WebGPU as a supported rendering path when available.
- Defined WebGL 2 as a compatibility path.
- Established local GPU rendering, adaptive quality, chunk loading, LOD, and memory optimization as technical requirements.

World Architecture

- Established a large-world streaming approach.
- Defined world coordinates, regions, sectors, and chunks as planned systems.
- Established that the entire world must not be loaded into memory simultaneously.

Platforms and Interface

- Defined desktop and mobile browser support.
- Established Arabic and English as the initial interface languages.
- Defined RTL and LTR layout support.
- Established the need for mobile touch controls and desktop controls.

Camera and Controls

- Established desktop movement and camera requirements.
- Added camera customization as a requirement for the in-game project editor.

Land and Real Estate

- Defined residential, commercial, industrial, and agricultural land categories.
- Established zoning, infrastructure, permit, and city-rule restrictions for land conversion.
- Defined land ownership, building, upgrading, development, selling, and reselling.
- Established land area as a factor in construction capacity.

Government Facilities

- Defined public facilities such as hospitals, schools, stadiums, and airports.
- Established an application and city manager approval process for government-facility acquisition or transfer.
- Defined the special real-money transfer arrangement:
  - Payment goes to the game developer.
  - The city receives the equivalent virtual amount.
- Clarified that this is separate from ordinary PAL transactions.

Construction and Project Creation

- Established modular construction and project editors.
- Defined customization of buildings, businesses, and projects.
- Added sandboxed custom behaviors as a requirement.
- Defined city approval for certain custom project behaviors.

PAL Economy

- Established PAL as the internal virtual currency.
- Defined PAL as non-withdrawable and non-convertible into USD or stablecoins.
- Defined a 3% tax on eligible PAL transactions for the city treasury.
- Cancelled the previous 10% ordinary commerce and advertising tax.
- Distinguished PAL taxation from the official account marketplace commission.

Resources and Production

- Established natural resource gathering and production.
- Defined agriculture, factories, manufacturing, food production, and resource trade.
- Established a plan for resources to become more difficult to obtain over time.
- Defined fixed initial prices before production markets become established, followed by market-based pricing when production and trade develop.

Businesses and Employment

- Established player-owned businesses.
- Defined employment listings and contracts.
- Established contract agreement and recordkeeping through the game communication system.

Offerwalls

- Established Offerwalls as a player activity and monetization system.
- Defined a target of six Offerwall network integrations.
- Defined PAL as the player reward.
- Defined real campaign revenue as the game operator's income.
- Required confirmed server-side postbacks before crediting rewards.
- Added idempotency, duplicate-event protection, reversal handling, and fraud prevention requirements.

Clipping

- Established clipping campaigns as another player activity option.
- Defined promotional video creation, editing, and publishing.
- Defined PAL rewards for players.
- Defined real-money campaign revenue for the game operator.

Business-Specific Campaign Rewards

- Established campaign-related virtual resource rewards for participating businesses.
- Defined factory, farm, shop, and transportation campaign examples.
- Required rewards to be specified by campaign rules and verified results.
- Rejected arbitrary or undefined campaign rewards.

Advertising

- Established public advertising boards and in-business advertising.
- Defined advertising contracts as planned systems.
- Left public advertising revenue distribution and public advertising contract taxation unresolved.

Official Account Marketplace

- Established an official marketplace for player-to-player account sales using real money.
- Defined a 10% marketplace commission.
- Defined the seller's share as 90%.
- Added account verification, secure transfer, session revocation, dispute handling, and transaction record requirements.
- Cancelled the unofficial marketplace as an authorized game marketplace.
- Distinguished official account sales from PAL-based in-world transactions.

Anti-Manipulation and Market Integrity

Approved monitoring mechanisms:

1. Market Analytics.
2. Price Anomaly Detection.
3. Transaction Monitoring.
4. Resource Monitoring.
5. Ownership Tracking.
6. Audit Ledger.
7. Investigation System.
8. Anti-Manipulation Rules.
9. Graduated Penalties.

Additional approved rules:

- No maximum price ceiling for land, real estate, products, or resources.
- Legitimate speculation is allowed.
- A high listing price alone is not proof of wrongdoing.
- Unusual price movements are investigation signals, not automatic evidence.
- Penalties require evidence and fair review.
- IP addresses and device fingerprints are risk indicators, not conclusive proof.

City Governance

- Established city managers and their development responsibilities.
- Defined road planning, lighting, sidewalks, decoration, public projects, and city development.
- Defined elections every four in-game years.
- Defined one in-game year as three real-world weeks.
- Defined a 60% resident approval threshold for the mayor-removal petition.
- Left final voting eligibility and quorum rules unresolved.
- Established city budget monitoring.

Transportation and Security

- Established roads, vehicles, airports, and inter-city travel as planned systems.
- Defined airports as government-owned travel hubs.
- Established player police and army roles as planned systems.
- Added city defense and inter-city conflict systems to the development scope.

Sports and Recreation

- Defined starter football fields in each city.
- Established 1v1, 3v3, and 5v5 formats.
- Added city leagues and tournaments.
- Separated standalone entertainment games from automatic integration with the main economy.

Life and Environment

- Established health, mood, food, sleep, and weather-related systems.
- Added wildlife and marine life to the world scope.
- Defined the player-life model:
  - Five lives.
  - A 10-day suspension after losing all five lives.
  - Five new lives after the suspension.
  - Preservation of account and owned property.

Maintenance

- Established a separate maintenance page requirement.

---

Additional Documentation Update — Proximity Voice Chat

Added Feature

Added proximity-based voice chat to the THE EARTH project specifications.

Approved Functional Requirements

- Players can communicate with nearby players through voice.
- Voice volume decreases as distance increases.
- Players outside the configured range cannot hear one another.
- Spatial 3D Audio communicates the approximate direction of the speaker.
- Voice communication is connected to player positions in the virtual world.
- Distant cities do not share voice conversations automatically.

Controls

- Push-to-Talk.
- Optional open microphone mode.
- Microphone mute.
- Individual player volume settings.
- Individual player mute.
- Player blocking.
- Voice abuse reporting.

Technical Requirements

- Desktop and mobile microphone support.
- Browser microphone permission.
- Low-latency communication.
- Distance-based audio attenuation.
- Server-side proximity validation.
- Protection against forged client positions.
- Bandwidth and battery optimization.

Roadmap Placement

Proximity Voice Chat is assigned to Stage 13:

Multiplayer and Real-Time Communication.

The feature is documented but is not yet implemented.

---

Development Roadmap

The approved high-level roadmap contains 20 stages:

1. Project Foundation.
2. World Coordinates and Land Grid.
3. Regions and Sectors.
4. Chunk Loading.
5. Terrain.
6. Roads and Infrastructure.
7. Cities and Public Facilities.
8. Graphics.
9. Player and Desktop Controls.
10. Mobile Controls.
11. Vehicles.
12. Accounts and Persistent Server.
13. Multiplayer and Real-Time Communication.
14. Land, Real Estate, and Construction.
15. Resources and Production.
16. PAL Economy and Trade.
17. Businesses and Employment.
18. City Management.
19. Inter-City Relations and Security.
20. Life and Social Systems, Testing, and Release Preparation.

---

Open Decisions

The following items remain unresolved:

- Total geographical size of the world.
- Distribution of regions, cities, oceans, and wilderness.
- Revenue distribution for public advertising spaces.
- Tax treatment of public advertising contracts.
- Exact structure of the USD 3,000 Creator Program purchase requirement.
- Platform for verifying publishing activity across three platforms.
- Voting eligibility and quorum calculations.
- Reference value calculations for certain products and rewards.
- Exact campaign-specific resource rewards.
- Detailed voice infrastructure provider and technical implementation.
- Numerical balancing of life, health, production, and economy systems.

These items require explicit decisions before being treated as finalized.

---

Important Status Notice

The entries in this changelog document approved requirements and project decisions.

They do not indicate that all listed systems have been coded, deployed, or tested.

A feature becomes implemented only after its code, required services, and data systems are completed and its acceptance tests have passed.
