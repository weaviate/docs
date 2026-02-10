/**
 * Generate docker-compose.yml content based on user selections
 */
export function generateDockerCompose(selections) {
  const {
    weaviate_version = 'v1.34.0',
    weaviate_volume = 'named-volume',
    local_modules = [],
    additional_modules = [],
    transformers_model,
    reranker_transformers_model,
    multi2vec_clip_model,
    model2vec_model,
    t2v_transformers_cuda = [],
    reranker_transformers_cuda = [],
    multi2vec_clip_cuda = [],
  } = selections;

  const allModules = [...local_modules, ...additional_modules];
  const weaviateVersion = weaviate_version.replace('v', '');

  // Start building the compose file
  let compose = `---
`;
  compose += `services:
  weaviate:
    command:
    - --host
    - 0.0.0.0
    - --port
    - '8080'
    - --scheme
    - http
    image: cr.weaviate.io/semitechnologies/weaviate:${weaviateVersion}
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
      ENABLE_MODULES: '${allModules.join(',')}'
      CLUSTER_HOSTNAME: 'node1'
`;

  if (local_modules.includes('text2vec-transformers')) {
    compose += `      TRANSFORMERS_INFERENCE_API: http://text2vec-transformers:8080\n`;
  }
  if (local_modules.includes('multi2vec-clip')) {
    compose += `      CLIP_INFERENCE_API: http://multi2vec-clip:8080\n`;
  }
  if (local_modules.includes('text2vec-model2vec')) {
    compose += `      MODEL2VEC_INFERENCE_API: http://text2vec-model2vec:8080\n`;
  }
  if (local_modules.includes('reranker-transformers')) {
    compose += `      RERANKER_INFERENCE_API: http://reranker-transformers:8080\n`;
  }

  // Add module service containers
  if (local_modules.includes('text2vec-transformers')) {
    compose += getInferenceService('text2vec-transformers', 'transformers-inference', transformers_model || 'sentence-transformers-multi-qa-MiniLM-L6-cos-v1', t2v_transformers_cuda.includes('enabled'));
  }
  if (local_modules.includes('reranker-transformers')) {
    compose += getInferenceService('reranker-transformers', 'reranker-transformers', reranker_transformers_model || 'cross-encoder-ms-marco-MiniLM-L-6-v2', reranker_transformers_cuda.includes('enabled'));
  }
  if (local_modules.includes('text2vec-ollama') || local_modules.includes('generative-ollama')) {
    compose += getOllamaService();
  }
  if (local_modules.includes('multi2vec-clip')) {
    compose += getClipService(multi2vec_clip_model || 'sentence-transformers-clip-ViT-B-32-multilingual-v1', multi2vec_clip_cuda.includes('enabled'));
  }
  if (local_modules.includes('text2vec-model2vec')) {
    compose += getModel2VecService(model2vec_model || 'minishlab-potion-base-32M');
  }

  // Add volumes section if needed
  if (weaviate_volume === 'named-volume' || local_modules.includes('text2vec-ollama') || local_modules.includes('generative-ollama')) {
    compose += `
volumes:
`;
    if (weaviate_volume === 'named-volume') {
      compose += `  weaviate_data:\n`;
    }
    if (local_modules.includes('text2vec-ollama') || local_modules.includes('generative-ollama')) {
      compose += `  ollama_data:\n`;
    }
  }

  return compose;
}

function getInferenceService(serviceName, imageName, model, cudaEnabled = false) {
  return `
  ${serviceName}:
    image: cr.weaviate.io/semitechnologies/${imageName}:${model}
    environment:
      ENABLE_CUDA: '${cudaEnabled ? '1' : '0'}'
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

function getClipService(model, cudaEnabled = false) {
  return `
  multi2vec-clip:
    image: cr.weaviate.io/semitechnologies/multi2vec-clip:${model}
    environment:
      ENABLE_CUDA: '${cudaEnabled ? '1' : '0'}'
`;
}

function getModel2VecService(model) {
  return `
  text2vec-model2vec:
    image: cr.weaviate.io/semitechnologies/model2vec-inference:${model}
`;
}

