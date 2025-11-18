/**
 * Generate docker-compose.yml content based on user selections
 */
export function generateDockerCompose(selections) {
  const {
    weaviate_version = 'v1.32.7',
    weaviate_volume = 'named-volume',
    local_modules = [],
    additional_modules = [],
    transformers_model,
    reranker_transformers_model,
    qna_model,
    ner_model,
    sum_model,
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
      OPENAI_APIKEY: \${OPENAI_APIKEY}
      COHERE_APIKEY: \${COHERE_APIKEY}
      AWS_ACCESS_KEY_ID: \${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: \${AWS_SECRET_ACCESS_KEY}
`;

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
  if (additional_modules.includes('qna-transformers')) {
    compose += getInferenceService('qna-transformers', qna_model || 'distilbert-base-uncased-distilled-squad');
  }
  if (additional_modules.includes('ner-transformers')) {
    compose += getInferenceService('ner-transformers', ner_model || 'dbmdz-bert-large-cased-finetuned-conll03-english');
  }
  if (additional_modules.includes('sum-transformers')) {
    compose += getInferenceService('sum-transformers', sum_model || 'facebook-bart-large-cnn-1.0.0');
  }
  if (local_modules.includes('text2vec-ollama') || local_modules.includes('generative-ollama')) {
    compose += getOllamaService();
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

