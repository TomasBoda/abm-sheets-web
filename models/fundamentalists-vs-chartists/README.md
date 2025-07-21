# Fundamentalists vs. Chartists

This model represents a simplified financial market populated by two types of traders: fundamentalists and chartists. It is inspired by real-world investor behavior and widely used in computational finance to understand price formation, volatility, and emergent market dynamics. The goal is to simulate how the interaction of different trading strategies influences the evolution of asset prices over time.

## Agents

Fundamentalists believe that assets have an intrinsic or "true" value, typically based on economic fundamentals like earnings or dividends. Their strategy is to buy when the market price is below the intrinsic value (expecting it to rise) and sell when the price is above it (expecting it to fall). Their demand is proportional to the difference between the current price and the perceived intrinsic value.

Chartists, also known as trend-followers or technical traders, base their decisions on past price movements. If the price has been rising, they expect it to continue rising, and thus they buy. If the price has been falling, they sell. This behavior is based on momentum and creates positive feedback loops in price dynamics.

## Market

The price of the asset is updated over discrete time steps (e.g., daily). At each step:

1. Each agent group calculates their demand based on their strategy.
2. These demands are summed to get the total excess demand in the market.
3. The price changes according to this excess demand — if demand is high, price goes up; if supply exceeds demand, price falls. This mimics the market-clearing mechanism where prices adjust to balance buying and selling pressure.

This process continues over many time steps, simulating how prices evolve due to the agents' interactions.

## Model

This agent-based model captures key aspects of real financial markets:

- Price dynamics as a result of heterogeneous expectations: Fundamentalists provide a stabilizing force, pulling prices toward intrinsic value, while chartists create destabilizing trends.
- Market volatility: Even with a simple setup, the model can show booms, busts, and cycles due to the interplay of stabilizing and destabilizing behaviors.
- Endogenous complexity: Complex behavior emerges from the interaction of simple rules — a hallmark of agent-based modeling.
