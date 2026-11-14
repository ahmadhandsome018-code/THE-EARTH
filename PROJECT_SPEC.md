THE EARTH — Master Project Specification

Project: THE EARTH
Version: 0.1.0
Status: Initial Development
Document Type: Master Project Specification

---

1. Project Vision

THE EARTH is a persistent multiplayer 3D open-world simulation game.

The world combines:

- Realistic environments and cities.
- Player-owned land and properties.
- A player-driven economy.
- Businesses, industries, agriculture and trade.
- City governance and elections.
- Wildlife and environmental simulation.
- Health, food, weather and social systems.
- Player-created businesses, games and experiences.

The game must support desktop and mobile devices.

The world must remain persistent, with player accounts, ownership, economic transactions and city records saved on the server.

2. World Structure

2.1 Land and World Size

- The world contains 5,000,000 land squares designated for player ownership and development.
- Each square measures 5 × 5 meters.
- Each square covers 25 square meters.
- Total designated player land: 125 square kilometers.
- This is NOT the total size of the world.

The complete world also includes:

- Cities.
- Government facilities.
- Roads and transportation networks.
- Airports and ports.
- Lakes, rivers and coastlines.
- Mountains, forests and deserts.
- Natural and protected environments.

The total world area remains to be determined.

2.2 World Streaming

The entire world must never need to load at once.

Use:

- Chunk streaming.
- Level of Detail (LOD).
- Frustum culling.
- Occlusion culling.
- Instanced rendering.
- Network interest management.
- Memory-aware asset loading.

2.3 Regions and Sectors

Previous planning figures included 125 regions, 12,500 sectors and 400 land squares per sector.

These are historical planning figures, not a finalized division of the complete world. Their distribution must be redesigned after determining the total world area.

3. Cities and Initial World

- The world begins with 12 cities.
- Cities have different economic and environmental specializations.
- Cities must contain basic infrastructure before players enter.
- Cities must not be completely empty or fully developed.

Initial public facilities include:

- Hospital.
- School.
- Football field.
- Airport.
- Public square.
- News and advertising boards.
- Roads and essential infrastructure.

The previously planned starter general store is cancelled.

3.1 First City Managers

- The first player who successfully selects and enters a city becomes its first manager in that city's history.
- This assignment must be atomic and server-authoritative.
- Simultaneous entry attempts must never create multiple first managers.
- The first manager's identity and appointment time must be preserved in historical records.

This rule is independent of the Founders Badge.

3.2 Founders Badge

- The first 1,000 players globally receive the Founders Badge.
- Ranking is based on global registration order.
- This is separate from city management appointments.

4. Graphics and Rendering

4.1 Graphics Quality

The game has four graphics settings:

1. Low.
2. Medium.
3. High.
4. Ultra.

Ultra is a special option that requires compatible hardware, graphics processing support and a successful performance check.

4.2 Ultra Graphics

Ultra targets extremely realistic photorealistic graphics.

Expected features:

- Advanced lighting.
- Realistic reflections.
- Detailed shadows.
- PBR materials.
- High-quality textures.
- Detailed vegetation.
- Realistic water.
- Atmospheric effects.
- High-quality buildings and interiors.
- Detailed characters and vehicles.
- Realistic environmental rendering.

Ultra must not be enabled on unsupported hardware.

4.3 Local Hardware Processing

Graphics should be processed locally using the player's hardware.

Technologies:

- WebGL 2.
- WebGPU when supported.
- Three.js.
- React Three Fiber.
- Drei.

The game should select a compatible rendering path and preserve fallback support.

GPU processing does not remove the need for optimization, streaming and memory management.

Photorealistic quality also depends on professional 3D models, textures, animation, lighting and environmental assets.

5. Camera and Controls

Supported camera modes:

- First-person.
- Third-person.
- Fixed camera.
- Orbit camera.
- Cinematic camera.
- Security camera.
- Free camera.

Camera editor options:

- Position.
- Rotation.
- Field of view.
- Tracking.
- Limits.
- Transitions.
- Effects.
- Triggers.

First-person is the primary walking camera.

Third-person is used behind vehicles while driving.

City managers may use camera customization for approved public projects.

6. Device Support

Supported:

- Desktop computers.
- Android devices.
- iPhones.

Desktop controls:

- WASD.
- Mouse.
- Space.
- E.
- Esc.

Mobile controls:

- Virtual joystick.
- Touch camera movement.
- Jump button.
- Interaction button.
- Menus.

The interface must support:

- Portrait mode.
- Landscape mode.
- Safe areas.
- Different screen sizes.
- Rotation without losing progress.

A 2D low-resource mode must use the same account, world, economy and player state. It must not be a separate world.

7. Languages

Initial launch languages:

- Arabic.
- English.

The architecture must allow future additions:

- French.
- Spanish.
- German.
- Russian.
- Japanese.
- Korean.
- Chinese.

Requirements:

- RTL support.
- LTR support.
- Per-account language preference.
- Language switching without losing progress.
- Localized interface text.
- Localized notifications and descriptions.
- Player names may retain their original scripts.

Future multilingual chat translation may be added.

8. Land and Real Estate

Land categories:

- Residential.
- Commercial.
- Industrial.
- Agricultural.

Ownership and development depend on zoning, infrastructure, permits and city regulations.

Players can:

- Purchase land.
- Build properties.
- Upgrade properties.
- Sell properties.
- Develop businesses.
- Resell existing buildings.

Selling an existing property transfers the building and its equipment as they are. It does not automatically demolish the property.

Property history and ownership changes must be preserved.

8.1 Minimum Property Price

Land and real estate cannot be listed for less than the equivalent of 10 USD according to the game's PAL reference value.

There is no universal 10 USD minimum for products.

Product minimum values must reflect their reference market value and include anti-manipulation protections.

9. Building and Creation Systems

Players must have access to modular building and project editors.

They can create:

- Buildings.
- Rooms.
- Interiors.
- Commercial facilities.
- Industrial facilities.
- Entertainment venues.
- Sports facilities.
- Custom products.
- Brands.
- Games and experiences.

Examples:

- A player-created phone brand.
- A player-owned factory manufacturing products.
- Cinemas.
- Theaters.
- Amusement parks.
- Water parks.
- Racing venues.
- Exhibitions.
- Shops.

Players may manufacture their own products or contract factories to manufacture them.

Projects may offer:

- Free access.
- Paid entry.
- Subscriptions.
- Events.

Player-created games must have their own mechanics, maps, models, characters, graphics and sounds.

Creator scripts must run in a secure sandbox. Unlimited server-side code execution is not allowed.

10. Creator Program

Entry requirements:

- Purchase of credits worth at least 3,000 USD.
- Identity verification.
- Compliance with program rules.

Eligible creators can:

- Create games.
- Create experiences.
- Create projects.
- Earn eligible cash payouts under program conditions.

Creators cannot sell their accounts as a substitute for withdrawing earnings.

The exact nature of the purchased 3,000 USD credits remains to be clarified before implementation.

Purchased credits, PAL and cash earnings must have separate accounting records.

11. Economy and PAL

PAL is the internal virtual currency.

PAL:

- Is used inside the world.
- Is not USD.
- Is not a cryptocurrency.
- Cannot be withdrawn as cash.
- Cannot be converted into USD or stablecoins.

All balances and transactions must be server-authoritative.

Every balance change must be recorded in an auditable ledger.

11.1 PAL Transaction Tax

A 3% city tax applies to eligible PAL transactions, including:

- Land and property sales.
- Product and goods sales.
- Paid services.
- Paid experiences.
- Paid games and activities inside the world.

The tax is allocated to the relevant city treasury.

The old general 10% tax on PAL commercial activity and advertising is cancelled.

The 10% account marketplace commission is a separate USD transaction and must not be confused with PAL taxation.

11.2 PAL Accounting

Maintain separate records for:

- Player PAL balances.
- City treasury balances.
- PAL transaction taxes.
- Real USD payments.
- Creator cash earnings.
- Purchased credits.

Do not mix real-money balances with PAL.

11.3 Economy Monitoring

Monitor:

- Total circulating PAL.
- PAL issuance.
- PAL expenditure.
- Sources of PAL.
- Economic sinks.
- Market prices.
- Production.
- Inventory.
- Demand.
- Purchasing power.

Taxes transferred to city treasuries remain within the PAL economy unless a separate authorized spending or removal mechanism is implemented.

12. Offerwalls and Clipping

The game owner receives real revenue from advertising and offerwall partners.

Players receive PAL, not USD, for eligible activities.

The player can choose between:

- Offerwalls.
- Clipping campaigns.

The initial plan targets six offerwall networks.

Offers vary by:

- Country.
- Device.
- Eligibility.
- Campaign availability.

Offerwall rewards must only be credited after confirmed postbacks.

Required protections:

- Idempotency.
- Reversal handling.
- Fraud detection.
- Transaction records.

12.1 Clipping

Players may edit and publish promotional video clips.

The player receives PAL according to the campaign rules.

The game owner receives the real campaign revenue.

13. Business and Production Economy

Businesses must produce appropriate goods and resources.

Examples:

- Factories produce industrial resources.
- Farms produce agricultural goods.
- Shops receive inventory.
- Transport companies receive operating resources.

Campaign rewards for businesses must be predetermined by campaign type and verified results.

Resources must not be generated randomly without economic justification.

Industries transform inputs into outputs. They must not create raw materials from nothing.

14. Resources and Industry

Natural resources include:

- Iron.
- Oil.
- Coal.
- Copper.
- Wood.

Industrial products include:

- Steel.
- Refined fuel.
- Vehicles.
- Machines.
- Construction materials.

Food resources include:

- Crops.
- Meat.
- Fish.
- Vegetables.
- Processed foods.

Resource extraction reduces reserves.

Renewable resources depend on environmental conditions, water, soil, weather, costs and regeneration.

Prices may begin with predefined reference values and later respond to supply, demand, inventory, production, transport and labor costs.

15. Agriculture and Food

Agriculture requires:

- Water.
- Suitable soil.
- Transportation.
- Storage.
- Labor.
- Weather conditions.

Food production must account for:

- Growth.
- Harvesting.
- Storage.
- Transportation.
- Spoilage.
- Processing.

Fishing and animal farming must follow appropriate environmental and production rules.

16. Wildlife and Environment

The world must include diverse:

- Mammals.
- Birds.
- Reptiles.
- Insects.
- Small organisms.
- Marine life.

Marine life includes fish, sharks, whales, dolphins, octopuses, squid, crustaceans, shellfish and turtles.

Each species must have:

- Habitat.
- Behavior.
- Diet.
- Reproduction.
- Activity patterns.
- Risk characteristics.

Fishing and hunting must affect population levels and ecological balance.

Some species are poisonous, unsafe to eat or protected.

Food may require processing and cooking.

Pollution and habitat destruction affect wildlife and ecosystems.

17. Infrastructure

Infrastructure includes:

- Roads.
- Bridges.
- Tunnels.
- Traffic signals.
- Sidewalks.
- Railways.
- Water wells and reservoirs.
- Water treatment.
- Sewage systems.
- Electricity generation and distribution.
- Internet and telecommunications.
- Gas networks.
- Street lighting.
- Waste management.
- Airports.
- Ports.

Every infrastructure system has capacity, quality, operating costs and maintenance requirements.

Neglect can cause:

- Road deterioration.
- Bridge safety problems.
- Water leaks.
- Water shortages.
- Sewage pollution.
- Power outages.
- Telecommunications failures.
- Railway delays.

City managers allocate budgets and may hire players or companies for maintenance.

18. Transportation

Civilian transportation:

- Buses.
- Taxis.
- Passenger trains.
- Private vehicles.
- Airports.

Commercial transportation:

- Trucks.
- Freight trains.
- Ships.
- Warehouses.
- Distribution centers.

Strategic transportation:

- Military logistics.
- Supply routes.
- Port and airport security.

Each transport type has:

- Capacity.
- Speed.
- Cost.
- Fuel consumption.
- Infrastructure requirements.

Distance affects delivery time, fuel, wages, food spoilage, travel costs and land values.

Airports connect cities for a fee.

19. Trade and International Relations

Cities and regions may establish:

- Import agreements.
- Export agreements.
- Transit agreements.
- Transport agreements.
- Economic alliances.
- Defense alliances.
- Neutrality agreements.

Rules may cover:

- Trade restrictions.
- Tensions.
- Blockades.
- War.
- Ceasefires.
- Peace agreements.
- Reconstruction.

War can affect infrastructure, supply routes, prices and logistics.

Neutral cities may experience different economic effects.

Player property must have protection and clear rules during conflicts.

20. City Governance

City managers control:

- Development approvals.
- Roads.
- Lighting.
- Sidewalks.
- Decoration.
- Public projects.
- City budgets.
- Maintenance.

Each city has a treasury.

Commercial activity and public advertising must follow the updated economic rules.

20.1 Elections

- Election cycle: every four in-game years.
- One in-game year equals three real weeks.
- One management cycle therefore equals 84 real days.
- Election quorum: 40%.
- Removing a manager requires approval from 60% of valid votes, provided quorum is reached.

The precise definition of eligible voters and quorum calculation must be finalized before implementation.

20.2 Manager Removal

A removal petition and vote must follow transparent rules.

Voting records must be protected against duplication and manipulation.

21. Government Facilities

Government facilities include:

- Hospitals.
- Schools.
- Stadiums.
- Airports.
- Other public facilities.

Government land is not ordinary player-owned land.

Transfer or sale requires:

- Application.
- City manager approval.
- Compliance with government-facility rules.

The real-money sale proceeds for a government facility go entirely to the game developer.

The city receives an equivalent PAL amount.

This is not the ordinary 3% PAL transaction tax.

22. Advertising

Player-owned advertising spaces generate revenue for the player according to the advertising contract.

Public advertising spaces may be contracted by the city with companies.

The revenue distribution for public advertising spaces remains undecided.

Do not automatically apply the old 10% advertising tax.

The tax treatment of public advertising contracts under the 3% PAL rule also requires a specific decision.

23. Official Account Marketplace

The black market is permanently cancelled.

The official marketplace is for player-to-player account sales in real USD.

Commission:

- Seller receives 90%.
- Game owner receives 10%.

Example:

- Account sale price: 10,000 USD.
- Seller receives: 9,000 USD.
- Game owner receives: 1,000 USD.

Account transfers require:

- Ownership verification.
- Identity checks when appropriate.
- Updating access credentials.
- Revoking old sessions.
- Recording transfer history.
- Dispute handling.
- Refund and fraud procedures.

External account sales are against the game's rules.

Detection must use fair investigations. IP addresses and device fingerprints are risk signals, not conclusive proof.

24. Identity Verification and Security

Identity verification using a national identity document or passport is required for sensitive cases, including:

- Account ownership transfers.
- Sensitive ownership changes.
- Suspected account takeover.
- Financial procedures requiring verification.

A simple IP or device change must not automatically require identity documents or cause an account ban.

Additional security checks may be used when justified.

Privacy, consent and applicable data-protection laws must be respected.

25. Health and Medical Simulation

The health system includes:

- Heart and circulation.
- Respiration.
- Muscles.
- Bones and joints.
- Nervous system.
- Nutrition.
- Hydration.
- Sleep.
- Fatigue.
- Mental wellbeing.
- Immunity.

Illness and injury can affect:

- Movement.
- Running.
- Strength.
- Balance.
- Endurance.
- Concentration.
- Recovery.

Medical facilities include:

- Hospitals.
- Clinics.
- Doctors.
- Examinations.
- Diagnosis.
- Treatment.
- Sports injuries.
- Accidents.
- Physical therapy.
- Rehabilitation.

This is a gameplay simulation, not a real medical diagnostic tool.

26. Food Preferences and Psychology

Food preferences include:

- Sweet.
- Salty.
- Sour.
- Bitter.
- Spicy.

Other preferences:

- Texture.
- Smell.
- Temperature.
- Appearance.

Players may develop likes and dislikes through experiences.

Food memories may relate to:

- Events.
- Friends.
- Places.
- Illness.
- Stress.
- Hunger.

Appetite depends on hunger, fullness, mood, stress, fatigue and sleep.

Food affects satisfaction, mood, energy and nutrition.

Restaurants can monitor aggregate customer reactions.

A meal may succeed in one city and perform poorly in another.

Food audio assets will be added manually by the project owner.

27. Weather and Environmental Audio

Weather includes:

- Temperature.
- Rain.
- Wind.
- Storms.
- Snow where appropriate.
- Humidity.
- Heat waves.
- Cold waves.
- Seasons.

Weather affects health, driving, agriculture, production and sports.

Environmental audio must be realistic and location-dependent.

Audio categories include:

- Forests.
- Birds.
- Wildlife.
- Wind.
- Water.
- Oceans.
- Rain.
- Thunder.
- Cities.
- Roads.
- Factories.
- Airports.
- Ports.
- Vehicles.
- Machinery.
- Human activity.

Audio changes according to location, weather, time and distance.

Audio streaming must be optimized.

28. Sleep

Initially, players can sleep only:

- In a home they own.
- In the street.

Do not introduce rented beds or public sleeping facilities without a separate approved decision.

29. Sports

Every initial city has a basic football field.

Supported match formats:

- 1v1.
- 3v3.
- 5v5.

Features:

- Open invitations.
- Private invitations.
- Team assignment.
- Match timers.
- Results.
- Player statistics.
- Leagues.
- Tournaments.
- Rankings.
- Top scorers.

Larger stadiums may be added later.

30. Death and Lives

- Each account has five lives.
- After all five lives are lost, the account is suspended for ten days.
- After the suspension, five new lives are provided.
- Account ownership and properties remain saved.
- The system records the cause of death.
- The player can see remaining lives and suspension time.

31. Economy Protection and Market Freedom

The game must protect market freedom while preventing deliberate market manipulation.

There is no fixed maximum price for:

- Land.
- Real estate.
- Products.
- Resources.

Players may freely determine listing prices.

Natural speculation and legitimate trading are allowed.

The game must not punish a player simply for listing an item at a high price.

31.1 Anti-Manipulation Systems

Implement:

1. Market Analytics.
2. Price Anomaly Detection.
3. Transaction Monitoring.
4. Resource Monitoring.
5. Ownership Tracking.
6. Audit Ledger.
7. Investigation System.
8. Anti-Manipulation Rules.
9. Graduated Penalties.

These systems must help identify:

- Artificial price inflation.
- Fake transactions.
- Coordinated manipulation.
- Market deception.
- Deliberate inventory manipulation.
- Fraudulent ownership patterns.
- Resource concentration associated with abusive conduct.

An unusual price movement is a signal for investigation, not proof of misconduct.

Penalties require evidence and a fair review process.

31.2 Economic Stability

Monitor:

- PAL issuance.
- PAL circulation.
- Economic sinks.
- Market liquidity.
- Production.
- Inventory.
- Supply and demand.
- Purchasing power.
- City treasury balances.

Do not impose arbitrary price ceilings as an inflation-control mechanism.

32. Creator Verification and Promotional Registration

The promotional registration requirement includes publishing the promotional video on at least three popular platforms.

Proof must use a specialized verification solution.

Possible methods:

- Official platform APIs.
- Post URLs.
- Manual review.

Zealy may be considered as a supporting solution only where its capabilities and platform integrations are confirmed.

Do not claim that every platform supports automated verification.

The registration flow must explain the requirement before registration.

The project must review platform rules regarding incentivized engagement and repetitive promotional content.

33. Maintenance Page

Create a separate maintenance page for:

- Server outages.
- Scheduled maintenance.
- Updates.
- Infrastructure improvements.

The page should display:

- Reason for downtime.
- Server status.
- Estimated completion time when known.
- Progress only when supported by actual data.

The maintenance page should be hosted independently from the main game services where possible.

34. Technical Architecture

Initial frontend:

- React.
- Vite.
- Three.js.
- React Three Fiber.
- Drei.

Later physics:

- Rapier.

Proposed infrastructure:

- Cloudflare Pages.
- Cloudflare Workers.
- Durable Objects.
- WebSockets.
- D1.
- R2.

GitHub manages the source code.

Cloudflare Free is suitable for experimentation and early development, but must not be assumed sufficient for millions of users or high concurrency.

Infrastructure costs and capacity must be tested.

35. Server Authority and Data Integrity

The server must be authoritative for:

- Accounts.
- Ownership.
- PAL balances.
- Taxes.
- Transactions.
- City management.
- Elections.
- Lives.
- Creator earnings.
- Marketplace transfers.

Every sensitive transaction must be validated server-side.

The client must never be trusted to determine final economic balances.

36. Development Roadmap

The project is divided into 20 major stages.

1. Project foundation and files.
2. World coordinate system and five million land squares.
3. Regions and sectors.
4. Chunk loading.
5. Terrain, mountains, rivers, lakes and coasts.
6. Roads, transportation and infrastructure.
7. Cities and initial public facilities.
8. Graphics, lighting, shadows and materials.
9. Player, movement, camera and controls.
10. Mobile touch and screen orientation.
11. Vehicles and transportation.
12. Accounts, backend and persistent storage.
13. Multiplayer and real-time communication.
14. Land, real estate, building and project editors.
15. Natural resources, industry, agriculture and food.
16. PAL economy, trade, imports and exports.
17. Jobs, businesses, advertising and official marketplace.
18. City management, elections, budgets and maintenance.
19. Inter-city relations, alliances, police, military and conflicts.
20. Health, wildlife, sports, weather, sleep and social systems, followed by testing and launch.

Each stage must have tests before the next stage begins.

37. Open Decisions

The following decisions remain unresolved and must not be invented:

1. Total world area and final region/sector distribution.
2. Revenue distribution for public advertising spaces.
3. Exact tax treatment of public advertising contracts.
4. Exact nature of the 3,000 USD Creator Program purchased credits.
5. Final verification provider for promotional publishing across three platforms.
6. Payment provider approval for PAL purchases and account marketplace transactions.
7. Creator cash payout provider and eligibility.
8. Exact eligible voter population and quorum calculation.
9. Product reference-value methodology and update frequency.
10. Exact economic resource rewards for each campaign type.

38. Development Principles

- Do not silently remove approved features.
- Do not change economic rules without approval.
- Do not mix PAL with real USD.
- Do not introduce price ceilings.
- Do not confuse first city managers with Founders Badge recipients.
- Do not treat five million land squares as the complete world.
- Do not assume all devices can run Ultra.
- Do not claim a feature is implemented until it has been built and tested.
- Preserve project documentation as the project evolves.
- Update CHANGELOG.md after meaningful changes.
- Test every development stage.
