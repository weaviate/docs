/**
 * Generate docker-compose.yml content based on user selections
 * This is a simplified version focused on the most common configurations
 */

export function generateDockerCompose(selections) {
  const {
    weaviate_version = 'v1.32.7',
    weaviate_volume = 'named-volume',
    modules = 'none',
    media_type,
    text_module,
    transformers_model,
    openai_key_approval,
    cohere_key_approval,
    image_neural_model,
  } = selections;

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
      DEFAULT_VECTORIZER_MODULE: '${getDefaultVectorizer(selections)}'
      ENABLE_MODULES: '${getEnabledModules(selections)}'
      CLUSTER_HOSTNAME: 'node1'
`;

  // Add module-specific environment variables
  if (text_module === 'text2vec-openai' && openai_key_approval === 'yes') {
    compose += `      OPENAI_APIKEY: \${OPENAI_APIKEY}
`;
  }

  if (text_module === 'text2vec-cohere' && cohere_key_approval === 'yes') {
    compose += `      COHERE_APIKEY: \${COHERE_APIKEY}
`;
  }

  // Add module containers if needed
  if (modules === 'modules') {
    if (text_module === 'text2vec-transformers') {
      compose += getTransformersService(transformers_model);
    }

    if (text_module === 'text2vec-ollama') {
      compose += getOllamaService();
    }

    if (media_type === 'image' || media_type === 'image,text') {
      compose += getImageService(image_neural_model);
    }
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

function getDefaultVectorizer(selections) {
  if (selections.modules === 'none') {
    return 'none';
  }

  if (selections.text_module) {
    return selections.text_module;
  }

  return 'none';
}

function getEnabledModules(selections) {
  if (selections.modules === 'none') {
    return '';
  }

  const modules = [];

  if (selections.text_module) {
    modules.push(selections.text_module);
  }

  if (selections.media_type === 'image' || selections.media_type === 'image,text') {
    modules.push('img2vec-neural');
  }

  return modules.join(',');
}

function getTransformersService(model) {
  if (!model) return '';

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

function getImageService(model) {
  if (!model) return '';

  const modelTag = model === 'pytorch-resnet50' ? 'pytorch-resnet50' : 'resnet50';

  return `
  i2v-neural:
    image: cr.weaviate.io/semitechnologies/img2vec-${modelTag}:latest
    environment:
      ENABLE_CUDA: '0'
`;
}

