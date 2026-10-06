// How-to: Search > Boost results - TypeScript examples.
//
// Requires Weaviate v1.38+ and weaviate-client v3.14.0 or higher. Boost is
// gRPC-only - REST/curl is not supported.
//
// Uses the text2vec-transformers vectorizer. Run against the local stack
// in tests/docker-compose-anon.yml (Weaviate + transformers inference).

import assert from 'assert';

// ================================
// ===== INSTANTIATION-COMMON =====
// ================================

import weaviate, { dataType, tokenization, vectors } from 'weaviate-client';

const client = await weaviate.connectToLocal();

// ---- Fixture: an Articles collection with date + numeric properties ----
await client.collections.delete('Articles');
await client.collections.create({
  name: 'Articles',
  vectorizers: vectors.text2VecTransformers(),
  properties: [
    { name: 'title', dataType: dataType.TEXT },
    { name: 'category', dataType: dataType.TEXT, tokenization: tokenization.FIELD },
    { name: 'published', dataType: dataType.DATE },
    { name: 'likes', dataType: dataType.INT },
    { name: 'price', dataType: dataType.NUMBER },
    { name: 'draft', dataType: dataType.BOOLEAN },
  ],
});

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const articles = client.collections.use('Articles');
await articles.data.insertMany([
  { title: 'Transformers explained', category: 'research', published: daysAgo(2), likes: 100, price: 49.99, draft: false },
  { title: 'Old transformer survey', category: 'research', published: daysAgo(400), likes: 5000, price: 49.99, draft: false },
  { title: 'How to fine-tune a model', category: 'tutorial', published: daysAgo(1), likes: 30, price: 9.99, draft: false },
  { title: 'Pricing transformers', category: 'tutorial', published: daysAgo(10), likes: 5000000, price: 199.0, draft: false },
  { title: 'Draft: transformer architecture', category: 'research', published: daysAgo(3), likes: 200, price: 9.99, draft: true },
]);

// Wait briefly for the vectorizer to finish indexing the new objects.
await new Promise((resolve) => setTimeout(resolve, 3000));


// ==========================================
// ===== Filter boost (soft WHERE) =====
// ==========================================
{
// START BoostFilter
// Promote articles in the "research" category without filtering others out.
const response = await articles.query.nearText('transformer architectures', {
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: { ...articles.filter.byProperty('category').equal('research'), type: 'filter' },
        weight: 0.5,
      },
    ],
    weight: 0.5,
  },
  // highlight-end
  returnProperties: ['title', 'category'],
});

for (const object of response.objects) {
  console.log(object.properties.category, '-', object.properties.title);
}
// END BoostFilter

assert.equal(response.objects[0].properties.category, 'research');
}


// ==========================================
// ===== Property boost (numeric value) =====
// ==========================================
{
// START BoostProperty
// Bias toward articles with more `likes`. log1p dampens the long tail so a
// single 5-million-likes outlier doesn't dominate.
const response = await articles.query.nearText('transformer architectures', {
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: { property: 'likes', modifier: 'log1p', type: 'propertyValue' },
        weight: 0.7,
      },
    ],
    weight: 0.7,
  },
  // highlight-end
  returnProperties: ['title', 'likes'],
});

for (const object of response.objects) {
  console.log(object.properties.likes, '-', object.properties.title);
}
// END BoostProperty
}


// ==========================================
// ===== Time decay (boost recent docs) =====
// ==========================================
{
// START BoostTimeDecay
// Score decays exponentially over time. "30d scale" + decay 0.5 means an
// article that's 30 days old gets half the score of one published "now".
const response = await articles.query.nearText('transformer architectures', {
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: {
          property: 'published',
          origin: 'now',
          scale: '30d',
          curve: 'exponential',
          decay: 0.5,
          type: 'timeDecay',
        },
        weight: 0.6,
      },
    ],
    weight: 0.6,
  },
  // highlight-end
  returnProperties: ['title', 'published'],
});
// END BoostTimeDecay

// The 400-day-old "Old transformer survey" should be demoted vs the 2-day-old article.
const topTitles = response.objects.slice(0, 2).map((o) => o.properties.title);
assert.ok(!topTitles.includes('Old transformer survey'));
}


// ==========================================
// ===== Numeric decay (closest to a value) =====
// ==========================================
{
// START BoostNumericDecay
// Score peaks at a target price and falls off symmetrically. A gaussian
// curve gives a bell-shaped falloff: items within `offset` of $49.99 score
// 1.0, items at $59.99 (one scale away) score `decay`.
const response = await articles.query.nearText('transformer architectures', {
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: {
          property: 'price',
          origin: 49.99,
          scale: 10.0,
          curve: 'gaussian',
          decay: 0.5,
          type: 'numericDecay',
        },
        weight: 0.5,
      },
    ],
    weight: 0.5,
  },
  // highlight-end
  returnProperties: ['title', 'price'],
});
// END BoostNumericDecay

// Both top-2 results have the target price; the $199 outlier is pushed down.
assert.ok(response.objects.slice(0, 2).every((o) => o.properties.price === 49.99));
}


// ==========================================
// ===== Blend multiple conditions =====
// ==========================================
{
// START BoostBlend
// Combine two soft signals: recency (weight 2) + popularity (weight 1).
// The outer weight 0.4 controls how much the blended rank affects the
// final score; the inner weights are *per-condition* and balance each
// other.
const response = await articles.query.nearText('transformer architectures', {
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: { property: 'published', origin: 'now', scale: '30d', type: 'timeDecay' },
        weight: 2.0,
      },
      {
        func: { property: 'likes', modifier: 'log1p', type: 'propertyValue' },
        weight: 1.0,
      },
    ],
    weight: 0.4,
    depth: 200,  // rescore the top 200 vector matches
  },
  // highlight-end
  returnProperties: ['title', 'likes', 'published'],
});
// END BoostBlend

// Recency dominates, but the log1p-dampened 5M-likes article still surfaces
// in the top 3 - popularity is helping, not invisible.
assert.ok(response.objects.slice(0, 3).some((o) => o.properties.likes === 5000000));
}


// ==========================================
// ===== Negative weights demote =====
// ==========================================
{
// START BoostNegativeWeight
// A negative per-condition weight pushes matching documents DOWN - they
// stay in the result set but lose ground against everything else. Use
// this to deprioritize drafts without filtering them out entirely.
const response = await articles.query.bm25('transformer', {
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: { ...articles.filter.byProperty('draft').equal(true), type: 'filter' },
        weight: -2.0,
      },
    ],
    weight: 0.5,
  },
  // highlight-end
  returnProperties: ['title', 'draft'],
});
// END BoostNegativeWeight

// The draft article is still in results, just no longer first.
const allTitles = response.objects.map((o) => o.properties.title as string);
assert.ok(allTitles.some((t) => t.includes('Draft')));
assert.equal(response.objects[0].properties.draft, false);
}


// ==========================================
// ===== Boost on hybrid search =====
// ==========================================
{
// START BoostOnHybrid
// Hybrid keeps its own alpha-blend of BM25 + vector. The boost runs once
// over the fused hybrid result - the sub-search legs don't see it.
const response = await articles.query.hybrid('transformer architectures', {
  alpha: 0.75,
  limit: 5,
  // highlight-start
  boost: {
    conditions: [
      {
        func: { ...articles.filter.byProperty('category').equal('research'), type: 'filter' },
        weight: 1.0,
      },
      {
        func: { ...articles.filter.byProperty('draft').equal(true), type: 'filter' },
        weight: -2.0,
      },
    ],
    weight: 0.3,
  },
  // highlight-end
  returnProperties: ['title', 'category', 'draft'],
});
// END BoostOnHybrid

// Top result is research and not a draft - both boost legs worked.
assert.equal(response.objects[0].properties.category, 'research');
assert.equal(response.objects[0].properties.draft, false);
}


await client.collections.delete('Articles');
client.close();
