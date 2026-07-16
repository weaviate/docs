import 'dotenv/config';
import weaviate, { type WeaviateClient, vectors, dataType, configure } from 'weaviate-client';

interface DatasetItem {
    properties: any;
    vector?: number[];
}

export async function populateWeaviate(client: WeaviateClient, overwriteExisting: boolean = false): Promise<void> {
    if (overwriteExisting) {
        try {
            await client.collections.delete('ECommerce');
            await client.collections.delete('Weather');
            await client.collections.delete('FinancialContracts');
        } catch (error) {
            // Collections may not exist, continue
        }
    }

    // Create ECommerce collection
    if (!(await client.collections.exists('ECommerce'))) {
        await client.collections.create({
            name: 'ECommerce',
            description: 'A dataset that lists clothing items, their brands, prices, and more.',
            vectorizers: [
                vectors.text2VecWeaviate({
                    name: 'description_vector',
                    sourceProperties: ['description'],
                    vectorIndexConfig: configure.vectorIndex.hnsw()
                }),
                vectors.text2VecWeaviate({
                    name: 'name_description_brand_vector',
                    sourceProperties: ['name', 'description', 'brand'],
                    vectorIndexConfig: configure.vectorIndex.hnsw()
                })
            ],
            properties: [
                { name: 'collection', dataType: dataType.TEXT },
                { name: 'category', dataType: dataType.TEXT, description: 'The category to which the clothing item belongs' },
                { name: 'tags', dataType: dataType.TEXT_ARRAY, description: 'The tags that are associated with the clothing item' },
                { name: 'subcategory', dataType: dataType.TEXT },
                { name: 'name', dataType: dataType.TEXT },
                { name: 'description', dataType: dataType.TEXT, description: 'A detailed description of the clothing item' },
                { name: 'brand', dataType: dataType.TEXT, description: 'The brand of the clothing item' },
                { name: 'product_id', dataType: dataType.UUID },
                { name: 'colors', dataType: dataType.TEXT_ARRAY, description: 'The colors on the clothing item' },
                { name: 'reviews', dataType: dataType.TEXT_ARRAY },
                { name: 'image_url', dataType: dataType.TEXT },
                { name: 'price', dataType: dataType.NUMBER, description: 'The price of the clothing item in USD' }
            ]
        });
    }

    // Create Weather collection
    if (!(await client.collections.exists('Weather'))) {
        await client.collections.create({
            name: 'Weather',
            description: 'Daily weather information including temperature, wind speed, precipitation, pressure etc.',
            vectorizers: vectors.text2VecWeaviate(),
            properties: [
                { name: 'date', dataType: dataType.DATE },
                { name: 'humidity', dataType: dataType.NUMBER },
                { name: 'precipitation', dataType: dataType.NUMBER },
                { name: 'wind_speed', dataType: dataType.NUMBER },
                { name: 'visibility', dataType: dataType.NUMBER },
                { name: 'pressure', dataType: dataType.NUMBER },
                { name: 'temperature', dataType: dataType.NUMBER, description: 'temperature value in Celsius' }
            ]
        });
    }

    // Create FinancialContracts collection
    if (!(await client.collections.exists('FinancialContracts'))) {
        await client.collections.create({
            name: 'FinancialContracts',
            description: 'A dataset of financial contracts between individuals and/or companies, as well as information on the type of contract and who has authored them.',
            vectorizers: vectors.text2VecWeaviate()
        });
    }

    // Helper function to load dataset from HF Datasets Viewer API
    async function loadHFDataset(repo: string, config: string, split: string = 'train'): Promise<DatasetItem[]> {
        const url = `https://datasets-server.huggingface.co/rows?dataset=${repo}&config=${config}&split=${split}&limit=1000`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch dataset: ${response.statusText}`);
            }

            const data = await response.json();
            return data.rows.map((row: any) => row.row);
        } catch (error) {
            console.error(`Error loading dataset ${repo}/${config}:`, error);
            return [];
        }
    }

    const ecommerceCollection = client.collections.use('ECommerce');
    const weatherCollection = client.collections.use('Weather');
    const financialCollection = client.collections.use('FinancialContracts');

    try {
        const [ecommerceData, weatherData, financialData] = await Promise.all([
            loadHFDataset('weaviate/agents', 'query-agent-ecommerce', 'train'),
            loadHFDataset('weaviate/agents', 'query-agent-weather', 'train'),
            loadHFDataset('weaviate/agents', 'query-agent-financial-contracts', 'train')
        ]);

        if (ecommerceData.length > 0) {
            await ecommerceCollection.data.insertMany(
                ecommerceData.map(item => ({ properties: item.properties || item }))
            );
        }

        if (weatherData.length > 0) {
            await weatherCollection.data.insertMany(
                weatherData.map(item => ({
                    properties: item.properties || item,
                    vectors: item.vector ? { default: item.vector } : undefined
                }))
            );
        }

        if (financialData.length > 0) {
            await financialCollection.data.insertMany(
                financialData.map(item => ({
                    properties: item.properties || item,
                    vectors: item.vector ? { default: item.vector } : undefined
                }))
            );
        }
    } catch (error) {
        console.error('Error loading or inserting data:', error);
    }
}

export async function loadClientInternally(): Promise<WeaviateClient> {
    const headers = {
        'X-Cohere-API-Key': process.env.COHERE_API_KEY as string,
        'X-OpenAI-API-Key': process.env.OPENAI_API_KEY as string,
        'X-INFERENCE-PROVIDER-API-KEY': process.env.YOUR_INFERENCE_PROVIDER_KEY ?? '',
    };

    const client = await weaviate.connectToWeaviateCloud(
        process.env.WEAVIATE_URL as string,
        {
            authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY as string),
            headers,
        }
    );
    return client;
}
