(async () => {
  const AWS = require('aws-sdk');
  AWS.config.region = 'us-east-1';

  const elasticsearch = require('elasticsearch');
  const connectionClass = require('http-aws-es');

  AWS.config.httpOptions.timeout = 300000;

  const { EnvironmentCredentials } = AWS;

  const environment = {
    elasticsearchEndpoint: process.env.ELASTICSEARCH_ENDPOINT,
    region: 'us-east-1',
  };

  const searchClientCache = new elasticsearch.Client({
    amazonES: {
      credentials: new EnvironmentCredentials('AWS'),
      region: environment.region,
    },
    apiVersion: '7.1',
    connectionClass: connectionClass,
    host: {
      host: environment.elasticsearchEndpoint,
      port: 443,
      protocol: 'https',
    },
    log: 'warning',
  });

  try {
    const indexExists = await searchClientCache.indices.exists({
      body: {},
      index: 'efcms',
    });
    if (indexExists) {
      searchClientCache.indices.delete({
        index: 'efcms',
      });
    }
  } catch (e) {
    console.log(e);
  }
})();
