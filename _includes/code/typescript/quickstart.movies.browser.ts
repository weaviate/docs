// EndToEndExample
import weaviate, { dataType } from "weaviate-client";

// Step 1: Connect
// Set your credentials via the Connect button next to Run, or edit these values inline
const wcdHost = (process.env.WEAVIATE_URL || "localhost")
  .replace(/^https?:\/\//, "")
  .split("/")[0]
  .split(":")[0];
const wcdApiKey = process.env.WEAVIATE_API_KEY || "";
const isLocal = wcdHost === "localhost";

const client = await weaviate.connectToCustom({
  httpHost: wcdHost,
  httpPort: isLocal ? 8080 : 443,
  httpSecure: !isLocal,
  grpcHost: wcdHost,
  grpcPort: isLocal ? 8080 : 443,
  grpcSecure: !isLocal,
  authCredentials: wcdApiKey ? new weaviate.ApiKey(wcdApiKey) : undefined,
  skipInitChecks: true,
});

// Step 2: Create a collection (deleted first, so the example is safe to re-run)
await client.collections.delete("Movies");

const movies = await client.collections.create({
  name: "Movies",
  properties: [
    { name: "title", dataType: dataType.TEXT },
    { name: "description", dataType: dataType.TEXT },
    { name: "year", dataType: dataType.INT },
  ],
  // highlight-start
  vectorizers: weaviate.configure.vectors.text2VecWeaviate({
    // Weaviate Embeddings
    baseURL: "https://dev-embedding.labs.weaviate.io",
  }),
  // highlight-end
});
console.log(`Created collection: ${movies.name}`);

// Step 3: Import data, vectorized server-side by Weaviate Embeddings
const data = [
  { title: "The Matrix", description: "A hacker discovers reality is a simulation and joins a rebellion against the machines.", year: 1999 },
  { title: "Inception", description: "A thief who steals secrets through dream-sharing technology is given one final job, planting an idea.", year: 2010 },
  { title: "Interstellar", description: "Explorers travel through a wormhole in space to ensure humanity's survival.", year: 2014 },
  { title: "The Godfather", description: "The aging patriarch of a crime dynasty transfers control to his reluctant son.", year: 1972 },
  { title: "Spirited Away", description: "A young girl wanders into a world of spirits and must work in a bathhouse to free her parents.", year: 2001 },
  { title: "Toy Story", description: "A cowboy doll feels threatened when a new spaceman action figure becomes the favorite toy.", year: 1995 },
  { title: "Jaws", description: "A giant great white shark terrorizes a small beach community.", year: 1975 },
  { title: "La La Land", description: "A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles.", year: 2016 },
  { title: "Mad Max: Fury Road", description: "In a post-apocalyptic wasteland, a drifter and a rebel warrior flee a tyrant in an armored war rig.", year: 2015 },
  { title: "Finding Nemo", description: "A timid clownfish crosses the ocean to rescue his son, who was captured by a diver.", year: 2003 },
];

// highlight-start
const result = await movies.data.insertMany(data); // Vectorized server-side by Weaviate Embeddings
// highlight-end

if (result.hasErrors) {
  console.log(`Import errors: ${JSON.stringify(result.errors)}`);
} else {
  const aggregate = await movies.aggregate.overAll();
  console.log(`Imported ${aggregate.totalCount} movies`);
}

// Step 4: Semantic search
// The vector index updates in the background after import, so retry briefly
let response;
for (let attempt = 0; attempt < 15; attempt++) {
  // highlight-start
  response = await movies.query.nearText("a science fiction adventure in space", {
    limit: 3,
    returnMetadata: ["distance"],
  });
  // highlight-end
  if (response.objects.length > 0) {
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

for (const obj of response.objects) {
  console.log(`${obj.properties.title} (${obj.properties.year}) — distance ${obj.metadata?.distance?.toFixed(3)}`);
}

await client.close(); // Free up resources
// END EndToEndExample
