package io.weaviate.docs.search;

import io.weaviate.client6.Config;
import io.weaviate.client6.WeaviateClient;
// START MetaCount // START TextProp // START IntProp
import io.weaviate.client6.v1.collections.aggregate.AggregateGroupByResponse;
import io.weaviate.client6.v1.collections.aggregate.Metric;

// END MetaCount // END TextProp // END IntProp
// START GroupBy
import io.weaviate.client6.v1.collections.aggregate.AggregateGroupByRequest.GroupBy;

// END GroupBy
import io.weaviate.docs.helper.EnvHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("crud")
@Tag("vector-search")
public class AggregateTestV6 {

private static WeaviateClient client;

@BeforeAll
public static void beforeAll() {
    String scheme = EnvHelper.scheme("http");
    String host = EnvHelper.host("localhost");
    String port = EnvHelper.port("8080");

    Config config = new Config(scheme, host + ":" + port);
    client = new WeaviateClient(config);
}

@Test
public void shouldPerformVectorSearch() {
    String collectionName = "JeopardyQuestion";

    aggregateMetaCount(collectionName);
    aggregateTextProp(collectionName);
    aggregateIntProp(collectionName);
    aggregateGroupBy(collectionName);
}

private void aggregateMetaCount(String collectionName) {
    // START MetaCount
    var collection = client.collections.use(collectionName);

    AggregateGroupByResponse response = collection.aggregate.overAll(
            with -> with.includeTotalCount() // Include total count of groups
    );

    System.out.println("Aggregate query result: " + response);
    // END MetaCount
}

private void aggregateTextProp(String collectionName) {
    // START TextProp
    var collection = client.collections.use(collectionName);

    AggregateGroupByResponse response = collection.aggregate.overAll(
            with -> with.metrics(
                    Metric.text("textPropertyName", calculate -> calculate.includeTopOccurencesCount()))
                    .includeTotalCount() // Include total count of groups
    );

    System.out.println("Aggregate query result: " + response);
    // END TextProp
}

private void aggregateIntProp(String collectionName) {
    // START IntProp
    var collection = client.collections.use(collectionName);

    AggregateGroupByResponse response = collection.aggregate.overAll(
            with -> with.metrics(
                    Metric.integer("integerPropertyName", calculate -> calculate // Property for metrics
                            .min()
                            .max()
                            .count())));

    System.out.println("Aggregate query result: " + response);
    // END IntProp
}

private void aggregateGroupBy(String collectionName) {
    // START GroupBy
    var collection = client.collections.use(collectionName);

    AggregateGroupByResponse response = collection.aggregate.overAll(
            new GroupBy("groupByPropertyName") // Property to group by
    );

    System.out.println("Aggregate query result: " + response);
    // END GroupBy
}
}
