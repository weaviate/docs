export const courseData = {
  "starter_text_data": {
    title: "Text data with Weaviate",
    courseId: "PY_101T",
    body: "Project-based learning where you'll learn how to build with Weaviate and any text data. Weaviate generates the vectors for you.",
    buttonType: "Click here",
    buttonURL: "/academy/py/starter_text_data",
    badgeType: "course",
    isCourse: true,
    units: [
      "text_setup_weaviate", "text_collections", "text_searches", "text_rag"
    ],
    learningGoals: [
      "How to create a Weaviate instance, add data to it to enable semantic searching, and use AI through retrieval augmented generation."
    ],
    learningOutcomes: [
      "Create an instance of Weaviate for you to use",
      "Produce, store and index semantic (vector) data from source text",
      "Perform semantic, keyword and hybrid searches",
      "Use AI (large language models) to augment and transform retrieved data",
    ],
    note: "Python client (v4); project-based"
  },
  "starter_custom_vectors": {
    title: "Your own vectors with Weaviate",
    courseId: "PY_101V",
    body: "Project-based learning where you'll learn how to build with Weaviate and your own data and vectors. This version is for those who prefer to use your own vectors built outside of Weaviate.",
    buttonType: "Click here",
    buttonURL: "/academy/py/starter_custom_vectors",
    badgeType: "course",
    isCourse: true,
    units: [
      "byov_setup_weaviate", "byov_collections", "byov_searches", "byov_rag"
    ],
    learningGoals: [
      "How to create a cloud Weaviate instance, add data to it to enable semantic searching, and use AI through retrieval augmented generation."
    ],
    learningOutcomes: [
      "Create a instance of Weaviate for you to use",
      "Produce, store and index data with your own vectors",
      "Perform vector, keyword and hybrid searches",
      "Use AI (large language models) to augment and transform retrieved data",
    ],
    note: "Python client (v4); project-based"
  },
  "starter_multimodal": {
    title: "Multimodal data with Weaviate",
    courseId: "PY_101M",
    body: "Project-based learning where you'll learn how to build with Weaviate and multi-modal data. Weaviate generates the vectors for you.",
    buttonType: "Click here",
    buttonURL: "/academy/py/starter_multimodal_data",
    badgeType: "course",
    isCourse: true,
    units: [
      "docker_mm_basics", "mm_collections", "mm_searches", "mm_rag"
    ],
    learningGoals: [
      "How to create a local Weaviate instance, add data to it to enable multi-modal searching, and use AI through retrieval augmented generation."
    ],
    learningOutcomes: [
      "Create a local instance of Weaviate with a multimodal vectorizer module",
      "Produce, store and index multimodal data",
      "Perform multimodal searches",
      "Use AI (large language models) to augment and transform retrieved data",
    ],
    note: "Python client (v4); project-based"
  },
  "named_vectors": {
    title: "Flexible data representation: Named vectors",
    courseId: "PY_220",
    body: "Learn how named vectors can provide a flexible way to represent your data in Weaviate.",
    buttonType: "Click here",
    buttonURL: "/academy/py/named_vectors",
    badgeType: "course",
    isCourse: true,
    units: [

    ],
    learningGoals: [
      "What named vectors can be used for, and how to add them to your data collection."
    ],
    learningOutcomes: [
      "Describe use cases for named vectors",
      "Create a collection with named vectors",
      "Add objects with multiple vector embeddings per object",
      "Perform searches on named vectors",
    ],
    note: "Python client (v4); project-based"
  },
  "vector_index": {
    title: "Vector indexes",
    courseId: "PY_230",
    body: "Vector indexes are the key components for vector search. Learn what they are, and how to use them effectively to suit your needs.",
    buttonType: "Click here",
    buttonURL: "/academy/py/vector_index",
    badgeType: "course",
    isCourse: true,
    units: [
      "vindex_overview", "vindex_hnsw", "vindex_flat", "vindex_dynamic"
    ],
    learningGoals: [
      "What vector index types are available, when to select each one and how to configure them."
    ],
    learningOutcomes: [
      "Name available vector index types in Weaviate.",
      "Select an appropriate index type for a given use case.",
      "Recite relationships between HNSW parameters and search performance.",
      "Describe how quantization affects each index type.",
      "Create collections with your chosen vector index type and preferred parameters.",
    ],
    note: "Python client (v4)"
  },
  "compression": {
    title: "Vector compression for improved efficiency",
    courseId: "PY_250",
    body: "Vectors can be compressed to reduce memory requirements or improve retrieval speeds. Find out how to get the most out of this feature.",
    buttonType: "Click here",
    buttonURL: "/academy/py/compression",
    badgeType: "course",
    isCourse: true,
    units: [
      "compression_pq", "compression_bq", "compression_strategy"
    ],
    learningGoals: [
      "What vector compression algorithms are available, how to use them and when to use them."
    ],
    learningOutcomes: [
      "Name available vector compression algorithms in Weaviate.",
      "Create collections with vector compression enabled.",
      "Configure vector compression parameters.",
      "Select a compression algorithm for a given use case.",
    ],
    note: "Python client (v4)"
  },
  "tokenization": {
    title: "Text tokenization",
    courseId: "PY_275",
    body: "What happens when text is indexed, and searched, or converted into a vector? They are 'tokenized'. Learn what this is, and how you can make it work for you.",
    buttonType: "Click here",
    buttonURL: "/academy/py/tokenization",
    badgeType: "course",
    isCourse: true,
    units: [
      "tokenization_basics", "tokenization_options", "tokenization_filters", "tokenization_searches"
    ],
    learningGoals: [
      "What tokenization is, and why it is required."
    ],
    learningOutcomes: [
      "Identify tokenized text from raw text.",
      "Name different tokenization options in Weaviate.",
      "Select an appropriate tokenization option for a given use case.",
      "Name languages for which specific tokenization options are available.",
    ],
    note: "Python client (v4)"
  },
  "setup_weaviate_typescript": {
    title: "Set up TypeScript (or Javascript) for Weaviate",
    courseId: "TS_100",
    body: "A quick run through of how to set up and install the Weaviate TypeScript client.",
    buttonType: "Click here",
    buttonURL: "/academy/js/set_up_typescript",
    badgeType: "course",
    isCourse: true,
    units: [
      "setup_weaviate_typescript"
    ],
    learningGoals: [
      "Setup Weaviate to get started building TypeScript (or JavaScript) apps."
    ],
    learningOutcomes: [
      "Install Node.js",
      "(Optionally) Install and set up TypeScript",
      "Install the Weaviate client",
    ],
    note: "TS clients"
  },
  "starter_multimodal_typescript": {
    title: "Multimodal data with Weaviate",
    courseId: "TS_101M",
    body: "Project-based learning where you'll learn how to build with Weaviate and multi-modal data. Weaviate generates the vectors for you.",
    buttonType: "Click here",
    buttonURL: "/academy/js/starter_multimodal_data",
    badgeType: "course",
    isCourse: true,
    units: [
      "docker_mm_basics_ts", "mm_collections_ts", "mm_searches_ts", "mm_rag_ts"
    ],
    learningGoals: [
      "How to create a Weaviate instance, add data to it to enable multi-modal searching, and use AI through retrieval augmented generation."
    ],
    learningOutcomes: [
      "Create an instance of Weaviate with a multimodal vectorizer module",
      "Produce, store and index multimodal data",
      "Perform multimodal searches",
      "Use AI (large language models) to augment and transform retrieved data",
    ],
    note: "TS clients; project-based"
  },
  "multi-tenancy": {
    title: "Multi-tenancy",
    courseId: "PY_280",
    body: "Learn how to implement and manage multi-tenancy in Weaviate for efficient data isolation and resource management.",
    buttonType: "Click here",
    buttonURL: "/academy/py/multitenancy",
    badgeType: "course",
    isCourse: true,
    units: [
      "mt_overview", "mt_setup", "mt_tenant_data", "mt_manage_tenants"
    ],
    learningGoals: [
      "Understand multi-tenancy concepts and their application in Weaviate",
      "Learn how to set up and manage multi-tenant collections for scalable applications",
      "Master techniques for efficient resource management in multi-tenant environments"
    ],
    learningOutcomes: [
      "Explain the concept of multi-tenancy and its benefits in Weaviate",
      "Set up a Weaviate instance and configure collections for multi-tenancy",
      "Create, manage, and remove tenants in a multi-tenant collection",
      "Perform data operations and queries specific to individual tenants",
      "Implement efficient resource management using tenant activity statuses",
      "Utilize advanced features like auto-tenant creation, activation, and offloading",
      "Apply multi-tenancy concepts to real-world scenarios for improved scalability and data isolation"
    ],
    note: "Python client (v4)"
  },
  "starter_text_data_typescript": {
    title: "Text data with Weaviate",
    courseId: "TS_101T",
    body: "Project-based learning where you'll learn how to build with Weaviate and any text data. Weaviate generates the vectors for you.",
    buttonType: "Click here",
    buttonURL: "/academy/js/starter_text_data",
    badgeType: "course",
    isCourse: true,
    units: [
      "text_setup_weaviate_ts", "text_collections_ts", "text_searches_ts", "text_rag_ts"
    ],
    learningGoals: [
      "How to create a Weaviate instance, add data to it to enable semantic searching, and use AI through retrieval augmented generation."
    ],
    learningOutcomes: [
      "Create an instance of Weaviate for you to use",
      "Produce, store and index semantic (vector) data from source text",
      "Perform semantic, keyword and hybrid searches",
      "Use AI (large language models) to augment and transform retrieved data",
    ],
    note: "TS clients; project-based"
  },
  // "building_with_weaviate": {
  //   title: "Additional topics",
  //   courseId: "PY_200",
  //   body: "Expand on the `Getting to MVP` course for deeper dives into key topics vectorizer selection, multi-modal models, and best practices.",
  //   buttonType: "Click here",
  //   buttonURL: "/academy/py/building_with_weaviate",
  //   badgeType: "course",
  //   isCourse: true,
  //   units: [
  //     "which_search",
  //     "schema_design",
  //     "vectorizer_selection",
  //     "indexing",
  //   ],
  //   learningGoals: [
  //     "In-depth material and best practices to help you build with Weaviate, such as vectorization options, which searches to perform and how to work with your indexes."
  //   ],
  //   learningOutcomes: [
  //     "Select a suitable vectorizer for your given goals and situation.",
  //     "Understand practical differences between search methods and suggest a suitable technique for a given situation.",
  //     "Compare types of indexes used by Weaviate, and modify parameters to balance speed and recall.",
  //   ]
  // },
  // "configuring_weaviate_instance": {
  //   title: "Customization using modules",
  //   courseId: "2",
  //   body: "",
  //   buttonType: "Notify",
  //   badgeType: "course",
  //   isCourse: true,
  //   units: [
  //     "t2v_under_hood", "vectorizer_selection_2", "custom_models", "module_building"
  //   ],
  //   learningGoals: [
  //     "TBC"
  //   ],
  //   learningOutcomes: [
  //     "TBC"
  //   ]
  // },
  // "to_production": {
  //   title: "Getting to Production",
  //   courseId: "3",
  //   body: "Speed to production with authentication & authorization, backups, monitoring and replication.",
  //   buttonType: "Notify",
  //   badgeType: "course",
  //   isCourse: true,
  //   units: [
  //     "backups", "auth", "scaling", "replication", "migration", "kubernetes"
  //   ],
  //   learningGoals: [
  //     "TBC"
  //   ],
  //   learningOutcomes: [
  //     "TBC"
  //   ]
  // },
  "kubernetes_intro": {
    title: "Run Weaviate on Kubernetes",
    courseId: "D100",
    body: "Learn how to run Weaviate on a local kubernetes cluster with Minikube.",
    buttonType: "Click here",
    buttonURL: "/academy/deployment/k8s",
    badgeType: "course",
    isCourse: false,
    units: [
      "kubernetes_intro"
    ]
  },
  "standalone": {
    title: "Standalone units",
    courseId: "0",
    body: "Bite-sized, standalone units that can be reviewed by themselves.",
    buttonType: "Notify",
    badgeType: "course",
    isCourse: false,
    units: [
      "which_search",
      "chunking"
    ]
  },
  "standalone_js": {
    title: "Standalone units (JS/TS)",
    courseId: "0",
    body: "Bite-sized, standalone units that can be reviewed by themselves.",
    buttonType: "Notify",
    badgeType: "course",
    isCourse: false,
    units: [
      "which_search",
      "client_server",
      "using_ml_models",
    ]
  },
  "zero_to_mvp": {
    title: "Zero to MVP: The basics",
    courseId: "P3_1",
    body: "Start here: Get started with all the core knowledge and essential skills for building with Weaviate. Learn how to build a Weaviate database and effectively perform queries to find the right data.",
    buttonType: "Click here",
    buttonURL: "/academy/py/zero_to_mvp",
    badgeType: "course",
    isCourse: true,
    units: [
      "hello_weaviate", "queries_1", "schema_and_import", "queries_2"
    ],
    learningGoals: [
      "How to build a Weaviate instance and populate it with vectorized data, as well as how to construct queries to efficiently retrieve relevant data."
    ],
    learningOutcomes: [
      "Use Weaviate Cloud to create an instance of Weaviate",
      "Use appropriate query types and syntax to retrieve desired objects",
      "Outline what vector search is and how it works",
      "Demonstrate how to efficiently populate a Weaviate instance with data",
      "Differentiate BM25 and hybrid search techniques from vector search techniques",
    ],
    note: "Python client (v3)"
  }
};
