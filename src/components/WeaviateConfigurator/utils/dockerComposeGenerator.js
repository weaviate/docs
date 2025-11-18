/**
 * Generate docker-compose.yml content based on user selections
 */
export function generateDockerCompose(selections) {
  const {
    weaviate_version = 'v1.32.7',
    weaviate_volume = 'named-volume',
    authentication_scheme = 'none',
    local_modules = [],
    additional_modules = [],
    transformers_model,
    reranker_transformers_model,
    multi2vec_clip_model,
    ner_model,
  } = selections;

  const apiModules = [
    'text2vec-openai',
    'text2vec-cohere',
    'generative-openai',
    'generative-cohere',
    'generative-aws',
    'reranker-cohere',
  ];

  const allModules = [...apiModules, ...local_modules, ...additional_modules];
  const allVectorizers = ['text2vec-openai', 'text2vec-cohere', ...local_modules.filter(m => m.startsWith('text2vec-') || m.startsWith('img2vec-'))];

  // Start building the compose file
  let compose = `---
version: '3.4'
`;

  if (authentication_scheme !== 'none') {
    compose += `#
# IMPORTANT: Anonymous authentication is disabled.
# You must configure an authentication method (e.g., OIDC, API keys)
# for Weaviate to start.
#
# See https://weaviate.io/developers/weaviate/configuration/authentication
#
`;
  }

  compose += `services:
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
      AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: '${authentication_scheme === 'none'}'
      PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
      DEFAULT_VECTORIZER_MODULE: '${allVectorizers[0] || 'none'}'
      ENABLE_MODULES: '${allModules.join(',')}'
      CLUSTER_HOSTNAME: 'node1'
`;

  if (allModules.includes('text2vec-openai') || allModules.includes('generative-openai')) {
    compose += `      OPENAI_APIKEY: \${OPENAI_APIKEY}\n`;
  }
  if (allModules.includes('text2vec-cohere') || allModules.includes('generative-cohere') || allModules.includes('reranker-cohere')) {
    compose += `      COHERE_APIKEY: \${COHERE_APIKEY}\n`;
  }
  if (allModules.includes('generative-aws')) {
    compose += `      AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID}\n`;
    compose += `      AWS_SECRET_ACCESS_KEY: \${AWS_SECRET_ACCESS_KEY}\n`;
  }

  if (local_modules.includes('multi2vec-clip')) {
    compose += `      CLIP_INFERENCE_API: http://multi2vec-clip:8080\n`;
  }
  if (local_modules.includes('text2vec-model2vec')) {
    compose += `      MODEL2VEC_INFERENCE_API: http://text2vec-model2vec:8080\n`;
  }

  if (additional_modules.includes('backup-s3')) {
    compose += `      BACKUP_S3_BUCKET: \${BACKUP_S3_BUCKET}\n`;
  }

  // Add module service containers
  if (local_modules.includes('text2vec-transformers')) {
    compose += getInferenceService('t2v-transformers', transformers_model || 'sentence-transformers-multi-qa-MiniLM-L6-cos-v1');
  }
  if (additional_modules.includes('reranker-transformers')) {
    compose += getInferenceService('reranker-transformers', reranker_transformers_model || 'cross-encoder-ms-marco-MiniLM-L-6-v2');
  }
  if (additional_modules.includes('ner-transformers')) {
    compose += getInferenceService('ner-transformers', ner_model || 'dbmdz-bert-large-cased-finetuned-conll03-english');
  }
  if (local_modules.includes('text2vec-ollama') || local_modules.includes('generative-ollama')) {
    compose += getOllamaService();
  }
  if (local_modules.includes('multi2vec-clip')) {
    compose += getClipService(multi2vec_clip_model || 'sentence-transformers-clip-ViT-B-32-multilingual-v1');
  }
  if (local_modules.includes('text2vec-model2vec')) {
    compose += getModel2VecService();
  }
  if (local_modules.includes('img2vec-neural-pytorch')) {
    compose += getImageService('pytorch');
  }
  if (local_modules.includes('img2vec-neural-keras')) {
    compose += getImageService('keras');
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

function getInferenceService(moduleName, model) {
  const imageName = moduleName.replace(/-/g, '_');
  return `
  ${moduleName}:
    image: cr.weaviate.io/semitechnologies/${moduleName}-inference:${model}
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

function getClipService(model) {
  return `
  multi2vec-clip:
    image: cr.weaviate.io/semitechnologies/multi2vec-clip:${model}
    environment:
      ENABLE_CUDA: '0'
`;
}

function getModel2VecService() {
  return `
  text2vec-model2vec:
    image: cr.weaviate.io/semitechnologies/model2vec-inference:minishlab-potion-base-32M
`;
}

