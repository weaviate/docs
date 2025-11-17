/**
 * Generate docker-compose.yml content based on user selections
 */
export function generateDockerCompose(selections) {
  const {
    weaviate_version = 'v1.32.7',
    weaviate_volume = 'named-volume',
    text_vectorizers = [],
    image_vectorizers = [],
    rerankers = [],
    generative_modules = [],
    transformers_model,
  } = selections;

  const allModules = [...text_vectorizers, ...image_vectorizers, ...rerankers, ...generative_modules];
  const allVectorizers = [...text_vectorizers, ...image_vectorizers];

  // Start building the compose file
  let compose = `---
version: '3.4'
services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:${weaviate_version}
    ports:
    - 8080:8080
    - 50051:50051
`;

  // Add volumes
  if (weaviate_volume === 'named-volume') {
    compose += `    volumes:
    - weaviate_data:/var/lib/weaviate
`;
  } else if (weaviate_volume === 'host-binding') {
    compose += `    volumes:
    - ./weaviate_data:/var/lib/weaviate
`;
  }

  compose += `    restart: on-failure:0
    environment:
      QUERY_DEFAULTS_LIMIT: 25
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: '${allVectorizers[0] || 'none'}'
      ENABLE_MODULES: '${allModules.join(',')}'
      CLUSTER_HOSTNAME: 'node1'
`;

  // Add module-specific environment variables
  if (text_vectorizers.includes('text2vec-openai') || generative_modules.includes('generative-openai')) {
    compose += `      OPENAI_APIKEY: \${OPENAI_APIKEY}\n`;
  }

  if (
    text_vectorizers.includes('text2vec-cohere') ||
    rerankers.includes('reranker-cohere') ||
    generative_modules.includes('generative-cohere')
  ) {
    compose += `      COHERE_APIKEY: \${COHERE_APIKEY}\n`;
  }

  if (generative_modules.includes('generative-aws')) {
    compose += `      AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID}\n`;
    compose += `      AWS_SECRET_ACCESS_KEY: \${AWS_SECRET_ACCESS_KEY}\n`;
  }

  // Add module service containers
  if (text_vectorizers.includes('text2vec-transformers')) {
    compose += getTransformersService(transformers_model);
  }
  if (text_vectorizers.includes('text2vec-ollama')) {
    compose += getOllamaService();
  }
  if (image_vectorizers.includes('img2vec-neural-pytorch')) {
    compose += getImageService('pytorch');
  }
  if (image_vectorizers.includes('img2vec-neural-keras')) {
    compose += getImageService('keras');
  }

  // Add volumes section if needed
  if (weaviate_volume === 'named-volume') {
    compose += `
volumes:
  weaviate_data:
`;
  }

  return compose;
}

function getTransformersService(model) {
  const modelTag = model || 'sentence-transformers-multi-qa-MiniLM-L6-cos-v1';
  return `
  t2v-transformers:
    image: cr.weaviate.io/semitechnologies/transformers-inference:${modelTag}
    environment:
      ENABLE_CUDA: '0'
`;
}

function getOllamaService() {
  return `
  ollama:
    image: ollama/ollama:latest
    ports:
    - 11434:11434
    volumes:
    - ollama_data:/root/.ollama
`;
}

function getImageService(type) {
  const modelTag = type === 'pytorch' ? 'pytorch-resnet50' : 'resnet50';
  return `
  i2v-neural:
    image: cr.weaviate.io/semitechnologies/img2vec-neural:${modelTag}
    environment:
      ENABLE_CUDA: '0'
`;
}

