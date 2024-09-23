export const subgraphQuery = async (query) => {
  const response = await fetch(
    "https://subgraph.satsuma-prod.com/ce5e03f52f3b/synthetix/tokenvest/api",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }
  );
  return response.json();
};
